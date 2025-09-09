import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { GameSocket } from '../../type/game.socket';
import { getRoom, removeUserFromRoom } from '../../utils/redis.util';
import { getGamePacketType } from '../../utils/type.converter';
import leaveRoomNotificationHandler from '../notification/leave.room.notification.handler';
import leaveRoomResponseHandler from '../response/leave.room.response.handler';

const leaveRoomRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.leaveRoomRequest);
	if (!payload) return;

	const roomId = socket.roomId;

	if (!socket.userId || !roomId) {
		await leaveRoomResponseHandler(socket, setLeaveRoomResponse(false, GlobalFailCode.INVALID_REQUEST));
		return;
	}

	try {
		await removeUserFromRoom(roomId, socket.userId);

		// 성공 응답 및 알림 전송
		await leaveRoomResponseHandler(socket, setLeaveRoomResponse(true, GlobalFailCode.NONE_FAILCODE));
		const updatedRoom = await getRoom(roomId);
		if (updatedRoom) {
			await leaveRoomNotificationHandler(socket, gamePacket);
		}
	} catch (error) {
		let failCode = GlobalFailCode.UNKNOWN_ERROR;
		if (error instanceof Error) {
			if (error.message === '방을 찾을 수 없습니다.') {
				failCode = GlobalFailCode.ROOM_NOT_FOUND;
			} else {
				failCode = GlobalFailCode.UNKNOWN_ERROR;
			}
			await leaveRoomResponseHandler(socket, setLeaveRoomResponse(false, failCode));
		}
	}
};


const setLeaveRoomResponse = (
	success: boolean,
	failCode: GlobalFailCode,
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.leaveRoomResponse,
			leaveRoomResponse: {
    			success,
    			failCode,
			},
		},
	};

	return newGamePacket;
};

export default leaveRoomRequestHandler;
