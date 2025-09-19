import { CardType, CharacterStateType, PhaseType } from '../generated/common/enums';
import { Room } from '../models/room.model';
import { drawDeck, repeatDeck, shuffleDeck } from './card.manager';
import characterSpawnPosition from '../data/character.spawn.position.json';
import { CharacterPositionData } from '../generated/common/types';
import { shuffle } from '../utils/shuffle.util';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { broadcastDataToRoom } from '../utils/notification.util';
import { User } from '../models/user.model';
import { checkSatelliteTargetEffect } from '../card/card.satellite_target.effect';
import { setPositionUpdateNotification } from '../handlers/notification/position.update.notification.handler';
import { checkContainmentUnitTarget } from '../card/card.containment_unit.effect';
import { deleteRoom, getRoom, roomPhase, roomTimers, saveRoom } from '../utils/room.utils';

export const spawnPositions = characterSpawnPosition as CharacterPositionData[];
const positionUpdateIntervals = new Map<number, NodeJS.Timeout>();

export const notificationCharacterPosition = new Map<
	number, // roomId
	Map<string, CharacterPositionData> // userId → 위치 배열
>();

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

		const intervalId = setInterval(() => broadcastPositionUpdates(room), 100);

		positionUpdateIntervals.set(room.id, intervalId);
		this.scheduleNextPhase(room.id, roomId);
	}

	private scheduleNextPhase(roomId: number, roomTimerMapId: string) {
		this.clearTimer(roomTimerMapId);
		const dayInterval = 600000; // 1분
		const eveningInterval = 10000; //30초

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
			let room = getRoom(roomId);
			if (!room) return;

			if (nextPhase === PhaseType.DAY) {
				// 1. 위성 타겟 디버프 효과 체크 (하루 시작 시)
				room = (await checkSatelliteTargetEffect(room.id)) || room; // room 상태 변수 재갱신

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

						const drawCards = drawDeck(room.id, 2);
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
				for (let i = 0; i < room.users.length; i++) {
					if (room.users[i].character!.hp <= 0) {
						const pos = roomMap.get(room.users[i].id);
						if (pos) characterPosition[i] = pos;

						continue;
					}
					roomMap.set(room.users[i].id, characterPosition[i]);
				}
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

			saveRoom(room);

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

		deleteRoom(room.id);
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
			repeatDeck(room.id, [c.type]);
		}
	});

	return user;
};

export const broadcastPositionUpdates = (room: Room) => {
	const roomMap = notificationCharacterPosition.get(room.id);
	if (!roomMap) return; // 해당 방의 위치 정보가 없으면 종료

	const phase = roomPhase.get(`room:${room.id}`);

	if (phase === PhaseType.END) return;

	// 방의 유저 위치 배열 생성
	const characterPositions: CharacterPositionData[] = [];

	for (const [userId, positionData] of roomMap.entries()) {
		characterPositions.push({
			...positionData, // x, y 등 위치 정보
		});
	}

	// 위치 업데이트 패킷 생성
	const gamePacket = setPositionUpdateNotification(characterPositions);

	// 방의 모든 유저에게 전송
	broadcastDataToRoom(room.users, gamePacket, GamePacketType.positionUpdateNotification);
};

export default GameManager.getInstance();
