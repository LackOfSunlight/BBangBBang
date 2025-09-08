import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { broadcastDataToRoom } from '../../utils/notification.util.js';
import { Room } from '../../models/room.model.js';

const leaveRoomNotificationHandler = async (socket: GameSocket, roomData: Room) => {
	const notificationPacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.gamePrepareNotification,
			gamePrepareNotification: {
				room: roomData,
			},
		},
	};
	// 자신을 제외한 나머지 유저들에게 알림을 보냄
	broadcastDataToRoom(
		roomData.users,
		notificationPacket,
		GamePacketType.gamePrepareNotification,
		socket,
	);
};

export default leaveRoomNotificationHandler;
