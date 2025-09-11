import { CardType, PhaseType } from '../generated/common/enums';
import phaseUpdateNotificationHandler, {
	setPhaseUpdateNotification,
} from '../handlers/notification/phase.update.notification.handler';
import { Room } from '../models/room.model';
import { drawDeck, repeatDeck, shuffleDeck } from './card.manager';
import { getSocketByUserId } from './socket.manger';
import characterSpawnPosition from '../data/character.spawn.position.json';
import { CharacterPositionData } from '../generated/common/types';
import { shuffle } from '../utils/shuffle.util';
import { GameSocket } from '../type/game.socket';
import { saveRoom } from '../utils/redis.util';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { broadcastDataToRoom } from '../utils/notification.util';

export const spawnPositions = characterSpawnPosition as CharacterPositionData[];

class GameManager {
	private static instance: GameManager;
	private roomTimers = new Map<string, NodeJS.Timeout>();
	private roomPhase = new Map<string, PhaseType>();

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
		this.roomPhase.set(roomId, phase);

		this.scheduleNextPhase(room, roomId);
	}

	private scheduleNextPhase(room: Room, roomId: string) {
		this.clearTimer(roomId);
		const dayInterval = 10000; // 3분
		const eveningInterval = 10000; //30초

		let nextPhase: PhaseType;
		let interval: number;
		if (this.roomPhase.get(roomId) === PhaseType.DAY) {
			nextPhase = PhaseType.END;
			interval = dayInterval;
		} else {
			nextPhase = PhaseType.DAY;
			interval = eveningInterval;
		}

		const timer = setTimeout(async () => {
			this.roomPhase.set(roomId, nextPhase);

			if (nextPhase === PhaseType.DAY) {
				for (const user of room.users) {
					if (user.character != null) {
						//카드 삭제
						if (user.character.handCardsCount > user.character.hp) {
							console.log(
								`계산 전 userId:${user.id}, handCard:${user.character.handCardsCount}, hp:${user.character.hp}`,
							);
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
						} else {
							const drawCards = drawDeck(room.id, 2);
							drawCards.forEach((type) => {
								const existCard = user.character?.handCards.find((card) => card.type === type);
								if (existCard) {
									existCard.count += 1;
								} else {
									user.character?.handCards.push({ type, count: 1 });
								}
							});
						}

						user.character.handCardsCount = user.character.handCards.reduce(
							(sum, card) => sum + card.count,
							0,
						);

						console.log(
							`계산 후 userId:${user.id}, handCard:${user.character.handCardsCount}, hp:${user.character.hp}`,
						);
					}
				}
			}

			await saveRoom(room);

			const characterPosition = shuffle(spawnPositions);

			const phaseGamePacket: GamePacket = {
				payload: {
					oneofKind: GamePacketType.phaseUpdateNotification,
					phaseUpdateNotification: {
						phaseType: this.roomPhase.get(roomId) as PhaseType,
						nextPhaseAt: `${Date.now() + interval}`,
						characterPositions: characterPosition,
					},
				},
			};

			const userGamePacket: GamePacket = {
				payload: {
					oneofKind: GamePacketType.userUpdateNotification,
					userUpdateNotification: {
						user: room.users,
					},
				},
			};

			broadcastDataToRoom(room.users, phaseGamePacket, GamePacketType.phaseUpdateNotification);
			broadcastDataToRoom(room.users, userGamePacket, GamePacketType.userUpdateNotification);

			this.scheduleNextPhase(room, roomId);
		}, interval);

		this.roomTimers.set(roomId, timer);
	}

	public endGame(room: Room) {
		console.log(`Ending game in room ${room.id}`);
		// 기존 게임 종료 로직이 있다면 여기에 위치합니다.
		const roomId = `room:${room.id}`;
		this.roomPhase.delete(roomId);
		this.clearTimer(roomId);
	}

	private clearTimer(roomId: string) {
		const timer = this.roomTimers.get(roomId);
		if (timer) {
			clearTimeout(timer);
			this.roomTimers.delete(roomId);
			console.log(`[Room ${roomId}] Timer cleared.`);
		}
	}
}

export default GameManager.getInstance();
