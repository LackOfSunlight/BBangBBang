import { GamePacketType } from '../enums/gamePacketType';
import { GamePacket } from '../generated/gamePacket';
import { User } from '../models/user.model';
import { GameSocket } from '../type/game.socket';
import { sendData } from './send.data';
import { connectedSockets } from '../managers/socket.manger';
import { UserData } from '../generated/common/types';

// 특정 방의 모든 사용자에게 알림을 보내는 함수
export const broadcastDataToRoom = (
	users: UserData[],
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
