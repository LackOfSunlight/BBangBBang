import { CardType, CharacterStateType, PhaseType } from '../generated/common/enums';
import { Room } from '../models/room.model';
import characterSpawnPosition from '../data/character.spawn.position.json';
import { CharacterPositionData } from '../generated/common/types';
import { shuffle } from '../utils/shuffle.util';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { broadcastDataToRoom } from '../sockets/notification';
import { User } from '../models/user.model';
import { checkSatelliteTargetEffect } from '../card/debuff/card.satellite_target.effect';
import { checkContainmentUnitTarget } from '../card/debuff/card.containment_unit.effect';
import { positionUpdateNotificationForm } from '../converter/packet.form';
import { cardManager } from './card.manager';
import { bombManager } from '../card/debuff/card.bomb.effect';
import roomManger, { roomPhase, roomTimers } from './room.manger';

export const spawnPositions = characterSpawnPosition as CharacterPositionData[];
const positionUpdateIntervals = new Map<number, NodeJS.Timeout>();

export const notificationCharacterPosition = new Map<
	number, // roomId
	Map<string, CharacterPositionData> // userId → 위치 배열
>();

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

		const intervalId = setInterval(() => broadcastPositionUpdates(room), 10000000);

		positionUpdateIntervals.set(room.id, intervalId);
		this.scheduleNextPhase(room.id, roomId);
	}

	private scheduleNextPhase(roomId: number, roomTimerMapId: string) {
		this.clearTimer(roomTimerMapId);
		const dayInterval = 600000; // 1분
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
			let room = roomManger.getRoom(roomId);
			if (!room) return;

			if (nextPhase === PhaseType.DAY) {
				// 1. 위성 타겟 디버프 효과 체크 (하루 시작 시)
				room = (await checkSatelliteTargetEffect(room)) || room; // room 상태 변수 재갱신

				room = (await checkContainmentUnitTarget(room.id)) || room;

				// 2. 카드 처리
				for (let user of room.users) {
					if (user.character != null) {
						console.log(
							`${user.nickname}의 상태1:${CharacterStateType[user.character!.stateInfo!.state]}`,
						);

						//카드 삭제
						if (user.character.handCardsCount > user.character.hp) {
							user = removedCard(room, user);
						}

						if (user.character!.stateInfo?.state !== CharacterStateType.CONTAINED) {
							const drawCards = cardManager.drawDeck(room.id, 2);
							drawCards.forEach((type) => {
								const existCard = user.character?.handCards.find((card) => card.type === type);
								if (existCard) {
									existCard.count += 1;
								} else {
									user.character?.handCards.push({ type, count: 1 });
								}
							});

							user.character!.handCardsCount = user.character!.handCards.reduce(
								(sum, card) => sum + card.count,
								0,
							);
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

				broadcastDataToRoom(room.users, userGamePacket, GamePacketType.userUpdateNotification);
			}

			const characterPosition = shuffle(spawnPositions);

			const roomMap = notificationCharacterPosition.get(room.id);

			if (roomMap) {
				// 🎯 페이즈 변경 시에는 모든 플레이어 위치를 새로 할당
				roomMap.clear(); // 기존 데이터 정리
				
				for (let i = 0; i < room.users.length; i++) {
					// 모든 플레이어(죽은 플레이어 포함)에게 새로운 위치 할당
					roomMap.set(room.users[i].id, characterPosition[i]);
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
						characterPositions: characterPosition,
					},
				},
			};

			broadcastDataToRoom(room.users, phaseGamePacket, GamePacketType.phaseUpdateNotification);


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
    	bombManager.clearRoom(room.id);

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

const removedCard = (room: Room, user: User): User => {
	if (!user || !user.character) return user;

	const excess = user.character.handCardsCount - user.character.hp;
	let toRemove = excess;

	const removedCards: { type: CardType; count: number }[] = [];

	for (let i = 0; i < user.character.handCards.length && toRemove > 0; i++) {
		const card = user.character.handCards[i];

		if (card.count <= toRemove) {
			removedCards.push({ type: card.type, count: card.count });
			toRemove -= card.count;
			card.count = 0;
		} else {
			removedCards.push({ type: card.type, count: toRemove });
			card.count -= toRemove;
			toRemove = 0;
		}
	}

	user.character.handCards = user.character.handCards.filter((c) => c.count > 0);
	removedCards.forEach((c) => {
		for (let i = 0; i < c.count; i++) {
			cardManager.repeatDeck(room.id, [c.type]);
		}
	});

	return user;
};

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
			id: userId,  // 🔑 핵심: ID 포함
			x: positionData.x,
			y: positionData.y,
		});
	}

	// 데이터가 있을 때만 브로드캐스트
	if (characterPositions.length > 0) {
		// 위치 업데이트 패킷 생성
		const gamePacket = positionUpdateNotificationForm(characterPositions);

		// 방의 모든 유저에게 전송
		broadcastDataToRoom(room.users, gamePacket, GamePacketType.positionUpdateNotification);

		// 🎯 핵심: 브로드캐스트 후 Map 비우기 (다음 변화까지 대기)
		roomMap.clear();
	}

	// 변화 플래그 리셋 (다음 위치 변경까지 대기)
	roomPositionChanged.set(room.id, false);
};

export default GameManager.getInstance();
