import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { GameSocket } from '../../type/game.socket';
import { deleteRoom, getRoom, removeUserFromRoom, saveRoom } from '../../utils/redis.util';
import { getGamePacketType } from '../../utils/type.converter';
import leaveRoomNotificationHandler from '../notification/leave.room.notification.handler';
import leaveRoomResponseHandler from '../response/leave.room.response.handler';

const leaveRoomRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.leaveRoomRequest);
	if (!payload) return;

	const roomId = socket.roomId;
	const userId = socket.userId;

	if (!userId || !roomId) {
		await leaveRoomResponseHandler(
			socket,
			setLeaveRoomResponse(false, GlobalFailCode.INVALID_REQUEST),
		);
		return;
	}

	try {
		const room = await getRoom(roomId);
		if (!room) {
			await leaveRoomResponseHandler(
				socket,
				setLeaveRoomResponse(false, GlobalFailCode.ROOM_NOT_FOUND),
			);
			return;
		}

		// 방에서 나가는 유저를 제외한 나머지 유저 목록
		const remainingUsers = room.users.filter((u) => u.id !== userId);
		let isRoomDeleted = false;

		if (room.ownerId === userId) {
			// 방장이 나가는 경우
			if (remainingUsers.length > 0) {
				// 남은 유저가 있다면, 랜덤하게 방장 위임
				const newOwnerIndex = Math.floor(Math.random() * remainingUsers.length);
				room.ownerId = remainingUsers[newOwnerIndex].id;
				room.users = remainingUsers;
				await saveRoom(room);
			} else {
				// 남은 유저가 없으면 방 삭제
				await deleteRoom(roomId);
				isRoomDeleted = true;
			}
		} else {
			// 일반 유저가 나가는 경우
			room.users = remainingUsers;
			await saveRoom(room);
		}

		// 성공 응답 전송
		await leaveRoomResponseHandler(
			socket,
			setLeaveRoomResponse(true, GlobalFailCode.NONE_FAILCODE),
		);

		if (!isRoomDeleted) {
			// 방이 삭제되지 않았을 경우에만 알림 전송
			await leaveRoomNotificationHandler(socket, gamePacket);
		}
	} catch (error) {
		let failCode = GlobalFailCode.UNKNOWN_ERROR;
		if (error instanceof Error && error.message === 'Room not found') {
			failCode = GlobalFailCode.ROOM_NOT_FOUND;
		}
		await leaveRoomResponseHandler(
			socket,
			setLeaveRoomResponse(false, GlobalFailCode.UNKNOWN_ERROR),
		);
	}
};

export const setLeaveRoomResponse = (success: boolean, failCode: GlobalFailCode): GamePacket => {
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
