import { CardType, CharacterStateType, PhaseType } from '../generated/common/enums';
import { Room } from '../models/room.model';
import characterSpawnPosition from '../data/character.spawn.position.json';
import { CharacterPositionData } from '../generated/common/types';
import { shuffle } from '../utils/shuffle.util';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { broadcastDataToRoom } from '../sockets/notification';
import { positionUpdateNotificationForm } from '../converter/packet.form';
import roomManger, { roomPhase, roomTimers } from './room.manager';
import { setBombTimer } from '../services/set.bomb.timer.service';
import { cardPool, getCard } from '../dispatcher/apply.card.dispacher';
import { IPeriodicEffectCard } from '../type/card';

export const spawnPositions = characterSpawnPosition as CharacterPositionData[];
const positionUpdateIntervals = new Map<number, NodeJS.Timeout>();

export const notificationCharacterPosition = new Map<
	number, // roomId
	Map<string, CharacterPositionData> // userId → 위치 배열
>();

const prisonPosition: CharacterPositionData = {
	id: '21',
	x: 22,
	y: -4,
};

// 위치 변화 감지 플래그 (성능 최적화용)
export const roomPositionChanged = new Map<number, boolean>();

class GameManager {
	private static instance: GameManager;

	public static getInstance(): GameManager {
		if (!GameManager.instance) {
			GameManager.instance = new GameManager();
		}
		return GameManager.instance;
	}

	public startGame(room: Room) {
		console.log(`Starting game in room ${room.id}`);
		const roomId = `room:${room.id}`;
		const phase = PhaseType.DAY;
		roomPhase.set(roomId, phase);

		// 위치 변화 플래그 초기화 (최초 시작 시에는 true로 설정)
		roomPositionChanged.set(room.id, true);

		const intervalId = setInterval(() => broadcastPositionUpdates(room), 100);

		positionUpdateIntervals.set(room.id, intervalId);
		this.scheduleNextPhase(room.id, roomId);
	}

	private scheduleNextPhase(roomId: number, roomTimerMapId: string) {
		this.clearTimer(roomTimerMapId);
		const dayInterval = 60000; // 1분
		const eveningInterval = 30000; //30초

		let nextPhase: PhaseType;
		let interval: number;
		if (roomPhase.get(roomTimerMapId) === PhaseType.DAY) {
			nextPhase = PhaseType.END;
			interval = dayInterval;
		} else {
			nextPhase = PhaseType.DAY;
			interval = eveningInterval;
		}

		const timer = setTimeout(async () => {
			const timerExecutionTime = Date.now();
			roomPhase.set(roomTimerMapId, nextPhase);
			const room = roomManger.getRoom(roomId);
			if (!room) return;

			if (nextPhase === PhaseType.DAY) {
				// 1. 위성 타겟 디버프 효과 체크 (하루 시작 시)

				for (const card of cardPool.values()) {
					if ('onNewDay' in card) {
						console.log('이거 실행되지는 확인');
						await (card as IPeriodicEffectCard).onNewDay(room);
					}
				}

				// room = (await satelliteCard.checkSatelliteTargetEffect(room)) || room; // room 상태 변수 재갱신

				// room = (await containmentCard.checkContainmentUnitTarget(room.id)) || room;

				setBombTimer.clearRoom(room); // 밤 페이즈에 모든 폭탄 타이머 제거

				// 2. 카드 처리 (죽은 플레이어 제외)
				for (let user of room.users) {
					if (user.character != null && user.character.hp > 0) {
						console.log(
							`${user.nickname}의 상태1:${CharacterStateType[user.character!.stateInfo!.state]}`,
						);

						//카드 삭제
						if (user.character.handCardsCount > user.character.hp) {
							const removedCards = user.character.trashCards();

							removedCards.forEach((c) => {
								for (let i = 0; i < c.count; i++) {
									room.repeatDeck([c.type]);
								}
							});
						}

						if (user.character!.stateInfo?.state !== CharacterStateType.CONTAINED) {
							const drawCards = room.drawDeck(2);
							drawCards.forEach((type) => user.character?.addCardToUser(type));
						}

						user.character!.bbangCount = 0;
						if (user.character!.stateInfo!.state !== CharacterStateType.CONTAINED) {
							user.character!.stateInfo!.state = CharacterStateType.NONE_CHARACTER_STATE;
							user.character!.stateInfo!.nextState = CharacterStateType.NONE_CHARACTER_STATE;
							user.character!.stateInfo!.nextStateAt = '0';
							user.character!.stateInfo!.stateTargetUserId = '0';
						}
					}

					console.log(
						`${user.nickname}의 상태2:${CharacterStateType[user.character!.stateInfo!.state]}`,
					);
				}

				const userGamePacket: GamePacket = {
					payload: {
						oneofKind: GamePacketType.userUpdateNotification,
						userUpdateNotification: {
							user: room.users,
						},
					},
				};

				const toRoom = room.toData();

				broadcastDataToRoom(toRoom.users, userGamePacket, GamePacketType.userUpdateNotification);
			}

			const characterPosition = shuffle(spawnPositions);
			const resultPosition: CharacterPositionData[] = [];

			const roomMap = notificationCharacterPosition.get(room.id);

			if (roomMap) {
				// 🎯 페이즈 변경 시에는 모든 플레이어 위치를 새로 할당
				roomMap.clear(); // 기존 데이터 정리

				for (let i = 0; i < room.users.length; i++) {
					if (room.users[i].character?.stateInfo?.state === CharacterStateType.CONTAINED) {
						roomMap.set(room.users[i].id, prisonPosition);
						resultPosition.push(prisonPosition);
						continue;
					}
					// 모든 플레이어(죽은 플레이어 포함)에게 새로운 위치 할당
					roomMap.set(room.users[i].id, characterPosition[i]);
					resultPosition.push(characterPosition[i]);
				}

				// 🚀 페이즈 변경으로 인한 위치 변화 플래그 설정
				roomPositionChanged.set(room.id, true);
			}

			const newInterval = nextPhase === PhaseType.DAY ? dayInterval : eveningInterval;
			const elapsed = Date.now() - timerExecutionTime;
			const remainingTime = newInterval - elapsed;
			const phaseGamePacket: GamePacket = {
				payload: {
					oneofKind: GamePacketType.phaseUpdateNotification,
					phaseUpdateNotification: {
						phaseType: nextPhase,
						nextPhaseAt: `${remainingTime > 0 ? remainingTime : 0}`,
						characterPositions: resultPosition,
					},
				},
			};

			const toRoom = room.toData();

			for (let user of room.users) {
				console.log(`캐릭터타입: ${user.character?.characterType}`);
				console.log(`캐릭터 카드수: ${user.character?.handCardsCount}`);
			}

			broadcastDataToRoom(toRoom.users, phaseGamePacket, GamePacketType.phaseUpdateNotification);

			this.scheduleNextPhase(room.id, roomTimerMapId);
		}, interval);

		roomTimers.set(roomTimerMapId, timer);
	}

	public endGame(room: Room) {
		console.log(`Ending game in room ${room.id}`);
		// 기존 게임 종료 로직이 있다면 여기에 위치합니다.
		const roomId = `room:${room.id}`;
		roomPhase.delete(roomId);
		const intervalId = positionUpdateIntervals.get(room.id);
		if (intervalId) {
			clearInterval(intervalId);
			positionUpdateIntervals.delete(room.id); // Map에서 제거
		}
		this.clearTimer(roomId);

		// 방 종료 시 폭탄 타이머 정리
		setBombTimer.clearRoom(room);

		// 위치 변화 플래그 정리
		roomPositionChanged.delete(room.id);

		roomManger.deleteRoom(room.id);
	}

	private clearTimer(roomId: string) {
		const timer = roomTimers.get(roomId);
		if (timer) {
			clearTimeout(timer);
			roomTimers.delete(roomId);
			console.log(`[Room ${roomId}] Timer cleared.`);
		}
	}
}

export const broadcastPositionUpdates = (room: Room) => {
	const roomMap = notificationCharacterPosition.get(room.id);
	if (!roomMap) return; // 해당 방의 위치 정보가 없으면 종료

	const phase = roomPhase.get(`room:${room.id}`);
	if (phase === PhaseType.END) return;

	// 변화가 없으면 브로드캐스트 생략 (성능 최적화)
	const hasChanged = roomPositionChanged.get(room.id);
	if (!hasChanged) {
		return; // 위치 변화가 없으면 패킷 전송 생략
	}

	// 간단한 최적화: notificationCharacterPosition에 있는 데이터만 브로드캐스트
	// (position.update.usecase에서 이미 변화된 플레이어만 추가했으므로)
	const characterPositions: CharacterPositionData[] = [];

	for (const [userId, positionData] of roomMap.entries()) {
		characterPositions.push({
			id: userId, // 🔑 핵심: ID 포함
			x: positionData.x,
			y: positionData.y,
		});
	}

	// 데이터가 있을 때만 브로드캐스트
	if (characterPositions.length > 0) {
		// 위치 업데이트 패킷 생성
		const gamePacket = positionUpdateNotificationForm(characterPositions);

		const toRoom = room.toData();

		// 방의 모든 유저에게 전송
		broadcastDataToRoom(toRoom.users, gamePacket, GamePacketType.positionUpdateNotification);

		// 🎯 핵심: 브로드캐스트 후 Map 비우기 (다음 변화까지 대기)
		roomMap.clear();
	}

	// 변화 플래그 리셋 (다음 위치 변경까지 대기)
	roomPositionChanged.set(room.id, false);
};

export default GameManager.getInstance();
