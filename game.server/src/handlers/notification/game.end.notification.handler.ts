import { GameSocket } from '../../type/game.socket.js';
import { S2CGameEndNotification } from '../../generated/packet/notifications.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { WinType } from '../../generated/common/enums.js';
import { broadcastDataToRoom } from '../../utils/notification.util.js';
import { getRoom } from '../../utils/redis.util.js';
import { Room } from '../../models/room.model.js';

const gameEndNotificationHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	if (!socket.roomId) return;

	const room: Room | null = await getRoom(socket.roomId);
	if (!room) return;

	broadcastDataToRoom(room.users, gamePacket, GamePacketType.gameEndNotification);
};

export const setGameEndNotification = (winners: string[], winType: WinType): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.gameEndNotification,
			gameEndNotification: {
				winners,
				winType,
			},
		},
	};

	return newGamePacket;
};

export default gameEndNotificationHandler;
