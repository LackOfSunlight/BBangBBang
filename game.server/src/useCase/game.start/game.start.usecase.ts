import { GameSocket } from '../../type/game.socket';
import { GamePacket } from '../../generated/gamePacket';
import { C2SGameStartRequest } from '../../generated/packet/game_actions';
import { CardType, GlobalFailCode, PhaseType, RoomStateType } from '../../generated/common/enums';
import { GamePacketType } from '../../enums/gamePacketType';
import { Room } from '../../models/room.model';
import { CharacterPositionData, GameStateData } from '../../generated/common/types';
import { broadcastDataToRoom } from '../../sockets/notification';
import { shuffle } from '../../utils/shuffle.util';
import gameManager, { notificationCharacterPosition } from '../../managers/game.manager';
import {
	gameStartNotificationPacketForm,
	gameStartResponsePacketForm,
} from '../../converter/packet.form';
import roomManger from '../../managers/room.manager';
import characterSpawnPosition from '../../data/character.spawn.position.json';

export const gameStartUseCase = async (
	socket: GameSocket,
	req: C2SGameStartRequest,
): Promise<GamePacket> => {
	if (!socket.roomId) {
		return gameStartResponsePacketForm({
			success: false,
			failCode: GlobalFailCode.INVALID_REQUEST,
		});
	}

	try {
		const room: Room | null = roomManger.getRoom(socket.roomId);
		if (!room) {
			return gameStartResponsePacketForm({
				success: false,
				failCode: GlobalFailCode.ROOM_NOT_FOUND,
			});
		}

		// 스폰 위치 정보 로드 및 셔플
		const spawnPositions = characterSpawnPosition as CharacterPositionData[];
		const characterPositionsData = shuffle(spawnPositions);

		// 게임 상태 설정 (다음 페이즈까지의 시간 등)
		const duration = 60000; // 낮 시간 3분

		const gameState: GameStateData = {
			phaseType: PhaseType.DAY,
			nextPhaseAt: `${duration}`, // 첫 페이즈는 낮 시간으로 설정
		};

		// 카드 덱 초기화
		room.initializeDeck();

		// 캐릭터 위치 정보 저장을 위한 Map 초기화
		if (!notificationCharacterPosition.has(room.id)) {
			notificationCharacterPosition.set(room.id, new Map());
		}
		const posMap = notificationCharacterPosition.get(room.id)!;

		// 각 유저에게 위치 할당 및 초기 카드 분배
		for (let i = 0; i < room.users.length; i++) {
			const user = room.users[i];
			const character = user.character;

			posMap.set(user.id, characterPositionsData[i]); // 위치 정보 저장

			if (character) {
				const drawCards: CardType[] = room.drawDeck(character.hp);
				drawCards.forEach((type) => {
					const existCard = character.handCards.find((card) => card.type === type);
					if (existCard) {
						existCard.count += 1;
					} else {
						character.handCards.push({ type, count: 1 });
					}
				});

				character.handCards = [
					// { type: CardType.HALLUCINATION, count: 3 },
					{ type: CardType.SHIELD, count: 6 },
					// { type: CardType.SNIPER_GUN, count: 1 },
					{ type: CardType.BBANG, count: 10 },
					// { type: CardType.BIG_BBANG, count: 3 },
					// { type: CardType.ABSORB, count: 3 },
					// { type: CardType.AUTO_RIFLE, count: 3 },
					// { type: CardType.AUTO_SHIELD, count: 3 },
					// { type: CardType.CALL_119, count: 3 },
					{ type: CardType.CONTAINMENT_UNIT, count: 3 },
					{ type: CardType.DEATH_MATCH, count: 3 },
					// { type: CardType.DESERT_EAGLE, count: 3 },
					// { type: CardType.FLEA_MARKET, count: 3 },
					// { type: CardType.HAND_GUN, count: 3 },
					// { type: CardType.GUERRILLA, count: 3 },
					{ type: CardType.LASER_POINTER, count: 3 },
					// { type: CardType.MATURED_SAVINGS, count: 3 },
					// { type: CardType.RADAR, count: 3 },
					// { type: CardType.SATELLITE_TARGET, count: 3 },
					// { type: CardType.STEALTH_SUIT, count: 3 },
					// { type: CardType.VACCINE, count: 3 },
					// { type: CardType.WIN_LOTTERY, count: 3 },
					// { type: CardType.BOMB, count: 3 },
				];
				character.handCardsCount = character.handCards.reduce((sum, card) => sum + card.count, 0);
			}
		}

		// 방 상태 변경 및 저장
		room.state = RoomStateType.INGAME;

		// 게임 매니저를 통해 게임 시작 (타이머 등)
		gameManager.startGame(room);

		// 모든 플레이어에게 게임 시작 알림 전송
		const notificationPacket = gameStartNotificationPacketForm(
			gameState,
			room.users,
			characterPositionsData,
		);

		const toRoom = room.toData();

		broadcastDataToRoom(toRoom.users, notificationPacket, GamePacketType.gameStartNotification);

		// 요청자에게 성공 응답 반환
		return gameStartResponsePacketForm({ success: true, failCode: GlobalFailCode.NONE_FAILCODE });
	} catch (error) {
		console.error('Error in gameStartUseCase:', error);
		return gameStartResponsePacketForm({
			success: false,
			failCode: GlobalFailCode.UNKNOWN_ERROR,
		});
	}
};
