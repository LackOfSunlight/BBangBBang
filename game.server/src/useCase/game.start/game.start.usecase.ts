import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { C2SGameStartRequest, S2CGameStartResponse } from '../../generated/packet/game_actions.js';
import {
	CardType,
	GlobalFailCode,
	PhaseType,
	RoomStateType,
} from '../../generated/common/enums.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { getRoom, saveRoom } from '../../utils/room.utils.js';
import { Room } from '../../models/room.model.js';
import { User } from '../../models/user.model.js';
import { CharacterPositionData, GameStateData } from '../../generated/common/types.js';
import { S2CGameStartNotification } from '../../generated/packet/notifications.js';
import { broadcastDataToRoom } from '../../utils/notification.util.js';
import { shuffle } from '../../utils/shuffle.util.js';
import { drawDeck, initializeDeck } from '../../managers/card.manager.js';
import gameManager, { notificationCharacterPosition } from '../../managers/game.manager.js';
import characterSpawnPosition from '../../data/character.spawn.position.json';
import { testCard } from '../../init/test.card.js';

// 응답 패킷 생성 헬퍼
const createGameStartResponsePacket = (payload: S2CGameStartResponse): GamePacket => {
	return {
		payload: {
			oneofKind: 'gameStartResponse',
			gameStartResponse: payload,
		},
	};
};

// 알림 패킷 생성 헬퍼
const createGameStartNotificationPacket = (
	gameState: GameStateData,
	users: User[],
	characterPositions: CharacterPositionData[],
): GamePacket => {
	const payload: S2CGameStartNotification = {
		gameState,
		users,
		characterPositions,
	};
	return {
		payload: {
			oneofKind: 'gameStartNotification',
			gameStartNotification: payload,
		},
	};
};

export const gameStartUseCase = async (
	socket: GameSocket,
	req: C2SGameStartRequest,
): Promise<GamePacket> => {
	if (!socket.roomId) {
		return createGameStartResponsePacket({
			success: false,
			failCode: GlobalFailCode.INVALID_REQUEST,
		});
	}

	try {
		const room: Room | null = getRoom(socket.roomId);
		if (!room) {
			return createGameStartResponsePacket({
				success: false,
				failCode: GlobalFailCode.ROOM_NOT_FOUND,
			});
		}

		// 스폰 위치 정보 로드 및 셔플
		const spawnPositions = characterSpawnPosition as CharacterPositionData[];
		const characterPositionsData = shuffle(spawnPositions);

		// 게임 상태 설정 (다음 페이즈까지의 시간 등)
		const duration = 180000; // 낮 시간 3분

		const gameState: GameStateData = {
			phaseType: PhaseType.DAY,
			nextPhaseAt: `${duration}`, // 첫 페이즈는 낮 시간으로 설정
		};

		// 카드 덱 초기화
		initializeDeck(room.id);

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
				const drawCards: CardType[] = drawDeck(room.id, character.hp);
				drawCards.forEach((type) => {
					const existCard = character.handCards.find((card) => card.type === type);
					if (existCard) {
						existCard.count += 1;
					} else {
						character.handCards.push({ type, count: 1 });
					}
				});

				character.handCardsCount = character.handCards.reduce((sum, card) => sum + card.count, 0);
			}
		}

		// 방 상태 변경 및 저장
		room.state = RoomStateType.INGAME;
		saveRoom(room);

		// 게임 매니저를 통해 게임 시작 (타이머 등)
		gameManager.startGame(room);

		// 모든 플레이어에게 게임 시작 알림 전송
		const notificationPacket = createGameStartNotificationPacket(
			gameState,
			room.users,
			characterPositionsData,
		);
		broadcastDataToRoom(room.users, notificationPacket, GamePacketType.gameStartNotification);

		// 요청자에게 성공 응답 반환
		return createGameStartResponsePacket({ success: true, failCode: GlobalFailCode.NONE_FAILCODE });
	} catch (error) {
		console.error('Error in gameStartUseCase:', error);
		return createGameStartResponsePacket({
			success: false,
			failCode: GlobalFailCode.UNKNOWN_ERROR,
		});
	}
};
