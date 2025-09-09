import { GamePacketType } from '../enums/gamePacketType.js';
import { GamePacket } from '../generated/gamePacket.js';
import { User } from '../models/user.model.js';
import { connectedSockets } from '../sockets/socket.manger.js';
import { GameSocket } from '../type/game.socket.js';
import { sendData } from './send.data.js';

// 특정 방의 모든 사용자에게 알림을 보내는 함수
export const broadcastDataToRoom = (
	users: User[],
	gamePacket: GamePacket,
	packetType: GamePacketType,
	excludeSocket?: GameSocket,
) => {
	users.forEach((user) => {
		const targetSocket = connectedSockets.get(user.id);
		if (targetSocket && (!excludeSocket || targetSocket.userId !== excludeSocket.userId)) {
			sendData(targetSocket, gamePacket, packetType);
		}
	});
};
