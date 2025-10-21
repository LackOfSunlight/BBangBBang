import { GamePacketType } from '@game/enums/gamePacketType';
import { GamePacket } from '@core/generated/gamePacket';
import { User } from '@game/models/user.model';
import { GameSocket } from '@common/types/game.socket';
import { sendData } from './send.data';
import { connectedSockets } from '@game/managers/socket.manger';
import { UserData } from '@core/generated/common/types';

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
