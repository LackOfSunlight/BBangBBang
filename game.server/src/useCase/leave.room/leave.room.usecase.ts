import { GamePacketType } from '../../enums/gamePacketType';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { S2CLeaveRoomNotification } from '../../generated/packet/notifications';
import { C2SLeaveRoomRequest, S2CLeaveRoomResponse } from '../../generated/packet/room_actions';
import { GameSocket } from '../../type/game.socket';
import { deleteRoom, getRoom, removeUserFromRoom } from '../../utils/room.utils';
import { broadcastDataToRoom } from '../../utils/notification.util';
import { User } from '../../models/user.model';

// 방 나가기 응답 패킷을 생성하는 헬퍼 함수
const createLeaveRoomResponsePacket = (payload: S2CLeaveRoomResponse): GamePacket => {
	return {
		payload: {
			oneofKind: 'leaveRoomResponse',
			leaveRoomResponse: payload,
		},
	};
};

// 다른 유저에게 유저가 나갔음을 알리는 알림 패킷을 생성하는 헬퍼 함수
const createUserLeftNotificationPacket = (payload: S2CLeaveRoomNotification): GamePacket => {
	return {
		payload: {
			oneofKind: 'leaveRoomNotification',
			leaveRoomNotification: payload,
		},
	};
};

export const leaveRoomUseCase = async (
	socket: GameSocket,
	req: C2SLeaveRoomRequest,
): Promise<GamePacket> => {
	// 소켓에서 현재 유저 ID와 방 ID를 가져옴
	const { roomId, userId } = socket;

	// 유저가 방에 속해있지 않은 경우, 잘못된 요청으로 처리
	if (!roomId || !userId) {
		return createLeaveRoomResponsePacket({
			success: false,
			failCode: GlobalFailCode.INVALID_REQUEST,
		});
	}

	try {
		// 방 정보를 가져옴
		const room = await getRoom(roomId);
		// 방이 존재하지 않는 경우
		if (!room) {
			return createLeaveRoomResponsePacket({
				success: false,
				failCode: GlobalFailCode.ROOM_NOT_FOUND,
			});
		}

		// 요청한 유저가 실제로 방에 있는지 확인
		const userInRoom = room.users.find((u: User) => u.id === userId);
		if (!userInRoom) {
			return createLeaveRoomResponsePacket({
				success: false,
				failCode: GlobalFailCode.INVALID_REQUEST,
			});
		}

		// 소켓 상태에서 방 ID를 제거하여, 서버상에서 유저가 방을 나간 것으로 처리
		socket.roomId = undefined;

		// 방장이 나가는 경우
		if (room.ownerId === userId) {
			// 방에 있던 모든 유저 목록을 저장 (알림 전송용)
			const allUsersInRoom = [...room.users];
			// 방을 삭제
			await deleteRoom(roomId);

			// 방장에게 보낼 성공 응답 패킷
			const ownerResponsePacket = createLeaveRoomResponsePacket({
				success: true,
				failCode: GlobalFailCode.NONE_FAILCODE,
			});

			// 다른 유저들에게 '방이 닫혔음'을 알리기 위한 패킷
			const roomClosedPacket = createLeaveRoomResponsePacket({
				success: true,
				failCode: GlobalFailCode.NONE_FAILCODE,
			});
			// 방장을 제외한 모든 유저에게 방이 닫혔다고 알림
			broadcastDataToRoom(
				allUsersInRoom,
				roomClosedPacket,
				GamePacketType.leaveRoomResponse,
				socket, // 요청자(방장)는 제외
			);

			// 방장에게 최종 응답 반환
			return ownerResponsePacket;
		} else {
			// 일반 유저가 나가는 경우
			// 방에서 해당 유저를 제거
			await removeUserFromRoom(roomId, userId);
			// 남은 유저 목록을 필터링
			const remainingUsers = room.users.filter((u: User) => u.id !== userId);

			// 남은 유저들에게 '누가 나갔는지' 알림 패킷 생성
			const notificationPacket = createUserLeftNotificationPacket({ userId: userId });
			// 남은 유저들에게 알림 전송
			broadcastDataToRoom(remainingUsers, notificationPacket, GamePacketType.leaveRoomNotification);

			// 요청자에게 성공 응답 반환
			return createLeaveRoomResponsePacket({
				success: true,
				failCode: GlobalFailCode.NONE_FAILCODE,
			});
		}
	} catch (error) {
		// 에러 발생 시
		console.error('Error in leaveRoomUseCase:', error);
		// 롤백: 만약의 경우를 대비해 소켓의 roomId를 복구
		socket.roomId = roomId;
		// 요청자에게 에러 응답 반환
		return createLeaveRoomResponsePacket({
			success: false,
			failCode: GlobalFailCode.UNKNOWN_ERROR,
		});
	}
};
