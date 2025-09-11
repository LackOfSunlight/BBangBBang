import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import {
	CardType,
	CharacterType,
	GlobalFailCode,
	PhaseType,
	RoomStateType,
} from '../../generated/common/enums.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import gameStartResponseHandler from '../response/game.start.response.handler.js';
import gameStartNotificationHandler, {
	setGameStartNotification,
} from '../notification/game.start.notification.handler.js';
import characterSpawnPosition from '../../data/character.spawn.position.json';
import { getRoom, saveRoom } from '../../utils/redis.util.js';
import { Room } from '../../models/room.model.js';
import { CharacterPositionData, GameStateData } from '../../generated/common/types.js';
import { User } from '../../models/user.model.js';
import { drawDeck, initializeDeck } from '../../managers/card.manager.js';
import { shuffle } from '../../utils/shuffle.util.js';
import gameManager from '../../managers/game.manager.js';

const gameStartRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.gameStartRequest);

	if (!payload || !socket.roomId) {
		return gameStartResponseHandler(
			socket,
			setGameStartResponse(false, GlobalFailCode.UNKNOWN_ERROR),
		);
	}

	// 저장된 스폰위치 정보 로드
	const spawnPositions = characterSpawnPosition as CharacterPositionData[];

	const room: Room | null = await getRoom(socket.roomId);

	if (!room) {
		return gameStartResponseHandler(
			socket,
			setGameStartResponse(false, GlobalFailCode.ROOM_NOT_FOUND),
		);
	}

	const users: User[] = room.users;

	// 위치 셔플, 이걸 response로 전달
	const characterPositionsData = shuffle(spawnPositions);

	// 다음 스테이지 시간 설정
	const now = Date.now();
	const duration = 180000; // 3분 -> 180000ms
	const nextPhaseAt = now + duration;
	const gameState: GameStateData = {
		phaseType: PhaseType.DAY,
		nextPhaseAt: `${nextPhaseAt}`,
	};

	initializeDeck(room.id);

	for (const user of room.users) {
		const character = user.character;

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

            character.bbangCount = character.characterType === CharacterType.RED? 99:1;
            character.handCardsCount = drawCards.length;
		}
	}

	room.state = RoomStateType.INGAME;
	await saveRoom(room);

	gameManager.startGame(room);

	gameStartResponseHandler(socket, setGameStartResponse(true, GlobalFailCode.NONE_FAILCODE));
	gameStartNotificationHandler(
		socket,
		setGameStartNotification(gameState, users, characterPositionsData),
	);
};

const setGameStartResponse = (success: boolean, failCode: GlobalFailCode): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.gameStartResponse,
			gameStartResponse: {
				success,
				failCode,
			},
		},
	};

	return newGamePacket;
};

export default gameStartRequestHandler;
