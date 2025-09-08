import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { getRoom, removeUserFromRoom } from '../../utils/redis.util.js';
import { GlobalFailCode } from '../../generated/common/enums.js';
import { sendData } from '../../utils/send.data.js';
import { broadcastDataToRoom } from '../../utils/notification.util.js';
import leaveRoomResponseHandler from '../response/leave.room.response.handler.js';
import leaveRoomNotificationHandler from '../notification/leave.room.notification.handler.js';

const leaveRoomRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.leaveRoomRequest);
	if (!payload) return;

	const roomId = socket.roomId;

	if (!socket.userId || !roomId) {
		await leaveRoomResponseHandler(socket, GlobalFailCode.INVALID_REQUEST);
		return;
	}

	try {
		await removeUserFromRoom(roomId, socket.userId);

		// 성공 응답 및 알림 전송
		await leaveRoomResponseHandler(socket, GlobalFailCode.NONE_FAILCODE);
		const updatedRoom = await getRoom(roomId);
		if (updatedRoom) {
			await leaveRoomNotificationHandler(socket, updatedRoom);
		}
	} catch (error) {
		let failCode = GlobalFailCode.UNKNOWN_ERROR;
		if (error instanceof Error && error.message.includes('Room not found')) {
			failCode = GlobalFailCode.ROOM_NOT_FOUND;
		}
		await leaveRoomResponseHandler(socket, failCode);
	}
};

export default leaveRoomRequestHandler;
