import { GamePacketType } from '../enums/gamePacketType';
import { GlobalFailCode } from '../generated/common/enums';
import { GamePacket } from '../generated/gamePacket';
import { S2CLeaveRoomNotification } from '../generated/packet/notifications';
import { S2CLeaveRoomResponse } from '../generated/packet/room_actions';
import { GameSocket } from '../type/game.socket';
import { leaveRoomUseCase } from '../useCase/leave.room/leave.room.usecase';
import { broadcastDataToRoom } from '../utils/notification.util';
import { sendData } from '../utils/send.data';

const leaveRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const { userId, roomId } = socket;

	if (!userId || !roomId) {
		const failPacket = createLeaveRoomResponsePacket({ success: false, failCode: GlobalFailCode.INVALID_REQUEST });
		sendData(socket, failPacket, GamePacketType.leaveRoomResponse);
		return;
	}

	const result = await leaveRoomUseCase(userId, roomId);

	if (result.roomDeleted) {
		// 방장이 나가서 방이 삭제된 경우
		if (result.roomDeletedResponsePayload && result.broadcastTargets) {
			const roomClosedPacket = createLeaveRoomResponsePacket(result.roomDeletedResponsePayload);
			broadcastDataToRoom(
				result.broadcastTargets,
				roomClosedPacket,
				GamePacketType.leaveRoomResponse,
			);
		}
	} else {
		// 일반 유저가 나가거나, 유즈케이스가 실패한 경우
		const responsePacket = createLeaveRoomResponsePacket(result.responsePayload);
		sendData(socket, responsePacket, GamePacketType.leaveRoomResponse);

		// 성공적으로 나갔고, 남은 인원이 있다면 알림
		if (result.responsePayload.success && result.notificationPayload && result.broadcastTargets) {
			const notificationPacket = createUserLeftNotificationPacket(result.notificationPayload);
			broadcastDataToRoom(
				result.broadcastTargets,
				notificationPacket,
				GamePacketType.leaveRoomNotification,
				socket, // 요청자는 제외
			);
		}
	}
};

export default leaveRoomHandler;

// Helper functions now just wrap the payload in a GamePacket
function createLeaveRoomResponsePacket(payload: S2CLeaveRoomResponse): GamePacket {
	return {
		payload: {
			oneofKind: 'leaveRoomResponse',
			leaveRoomResponse: payload,
		},
	};
}

function createUserLeftNotificationPacket(payload: S2CLeaveRoomNotification): GamePacket {
	return {
		payload: {
			oneofKind: 'leaveRoomNotification',
			leaveRoomNotification: payload,
		},
	};
}