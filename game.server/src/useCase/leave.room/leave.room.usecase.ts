import { gamePackTypeSelect } from '../../enums/gamePacketType';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { S2CLeaveRoomNotification } from '../../generated/packet/notifications';
import { S2CLeaveRoomResponse } from '../../generated/packet/room_actions';
import { User } from '../../models/user.model';
import { GameSocket } from '../../type/game.socket';
import { getRoom } from '../../utils/room.utils';

import { getGamePacketType } from '../../utils/type.converter';

// UseCase의 반환 값 타입을 명확하게 정의합니다.
export interface LeaveRoomResult {
	responsePayload: S2CLeaveRoomResponse;
	notificationPayload?: S2CLeaveRoomNotification;
	roomDeletedResponsePayload?: S2CLeaveRoomResponse;
	broadcastTargets?: User[];
	roomDeleted: boolean;
}

export const leaveRoomUseCase = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.leaveRoomRequest);
	if (!payload) return;

	const roomId = socket.roomId;
	const userId = socket.userId;

	try {
		const room = await getRoom(roomId);
		if (!room) {
			return {
				responsePayload: { success: false, failCode: GlobalFailCode.ROOM_NOT_FOUND },
			};
		}

		// 방장이 나가는 경우
		if (room.ownerId === userId) {
			const allUsersInRoom: User[] = [...room.users];
			await Promise.all(allUsersInRoom.map((user) => removeUserFromRoom(roomId, user.id)));
			await deleteRoom(roomId);

			return {
				responsePayload: { success: true, failCode: GlobalFailCode.NONE_FAILCODE },
				roomDeletedResponsePayload: { success: true, failCode: GlobalFailCode.NONE_FAILCODE },
				broadcastTargets: allUsersInRoom,
				roomDeleted: true,
			};
		} else {
			// 일반 유저가 나가는 경우
			const remainingUsers: User[] = room.users.filter((u) => u.id !== userId);
			room.users = remainingUsers;
			await saveRoom(room);

			return {
				responsePayload: { success: true, failCode: GlobalFailCode.NONE_FAILCODE },
				notificationPayload: { userId: userId },
				broadcastTargets: remainingUsers,
				roomDeleted: false,
			};
		}
	} catch (error) {
		console.error('Error in leaveRoomUseCase:', error);
		return {
			responsePayload: { success: false, failCode: GlobalFailCode.UNKNOWN_ERROR },
			roomDeleted: false,
		};
	}
};
