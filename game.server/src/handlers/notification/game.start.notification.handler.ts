import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { CharacterPositionData, GameStateData } from '../../generated/common/types.js';
import { User } from '../../models/user.model.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { Room } from '../../models/room.model.js';
import { getRoom } from '../../utils/redis.util.js';
import { broadcastDataToRoom } from '../../utils/notification.util.js';

const gameStartNotificationHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const roomId = socket.roomId;

	if (!roomId) return;

	const room: Room | null = await getRoom(roomId);

	if (!room) return;

	broadcastDataToRoom(room.users, gamePacket, GamePacketType.gameStartNotification);
};

export const setGameStartNotification = (
	gameState: GameStateData,
	users: User[],
	characterPositions: CharacterPositionData[],
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.gameStartNotification,
			gameStartNotification: {
				gameState,
				users,
				characterPositions,
			},
		},
	};

	return newGamePacket;
};

export default gameStartNotificationHandler;
