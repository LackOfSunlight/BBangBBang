import { GamePacketType } from '../Enums/gamePacketType';
import { GamePacket } from '../Generated/gamePacket';
import { User } from '../Models/user.model';
import { GameSocket } from '../Type/game.socket';
import { sendData } from './send.data';
import { connectedSockets } from '../Managers/socket.manger';
import { UserData } from '../Generated/common/types';

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
