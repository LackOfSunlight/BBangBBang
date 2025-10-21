import { GamePacketType } from '@game/enums/gamePacketType';
import { GlobalFailCode } from '@core/generated/common/enums';
import { GamePacket } from '@core/generated/gamePacket';
import { S2CLeaveRoomNotification } from '@core/generated/packet/notifications';
import { C2SLeaveRoomRequest, S2CLeaveRoomResponse } from '@core/generated/packet/room_actions';
import { GameSocket } from '@common/types/game.socket';
import { broadcastDataToRoom } from '@core/network/sockets/notification';
import { User } from '@game/models/user.model';
import {
	leaveRoomResponsePacketForm,
	userLeftNotificationPacketForm,
} from '@common/converters/packet.form';
import roomManger from '@game/managers/room.manager';
// RoomService 제거: 엔티티 메서드 직접 사용
import { UserData } from '@core/generated/common/types';

export const leaveRoomUseCase = async (
	socket: GameSocket,
	req: C2SLeaveRoomRequest,
): Promise<GamePacket> => {
	// 소켓에서 현재 유저 ID와 방 ID를 가져옴
	const { roomId, userId } = socket;

	// 유저가 방에 속해있지 않은 경우, 잘못된 요청으로 처리
	if (!roomId || !userId) {
		return leaveRoomResponsePacketForm({
			success: false,
			failCode: GlobalFailCode.INVALID_REQUEST,
		});
	}

	try {
		// 방 정보를 가져옴
		const room = roomManger.getRoom(roomId);
		// 방이 존재하지 않는 경우
		if (!room) {
			return leaveRoomResponsePacketForm({
				success: false,
				failCode: GlobalFailCode.ROOM_NOT_FOUND,
			});
		}

		// 요청한 유저가 실제로 방에 있는지 확인
		const userInRoom = room.users.find((u: User) => u.id === userId);
		if (!userInRoom) {
			return leaveRoomResponsePacketForm({
				success: false,
				failCode: GlobalFailCode.INVALID_REQUEST,
			});
		}

		// 소켓 상태에서 방 ID를 제거하여, 서버상에서 유저가 방을 나간 것으로 처리
		socket.roomId = undefined;

		// 방장이 나가는 경우
		if (room.ownerId === userId) {
			const toRoom = room.toData();

			// 방에 있던 모든 유저 목록을 저장 (알림 전송용)
			const allUsersInRoom = [...toRoom.users];
			// 방을 삭제
			roomManger.deleteRoom(roomId);

			// 방장에게 보낼 성공 응답 패킷
			const ownerResponsePacket = leaveRoomResponsePacketForm({
				success: true,
				failCode: GlobalFailCode.NONE_FAILCODE,
			});

			// 다른 유저들에게 '방이 닫혔음'을 알리기 위한 패킷
			const roomClosedPacket = leaveRoomResponsePacketForm({
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
			// 일반 유저가 나가는 경우: 엔티티 메서드 사용
			room.removeUserFromRoom(userId);

			const toRoom = room.toData();

			// 남은 유저 목록을 필터링
			const remainingUsers = toRoom.users.filter((u: UserData) => u.id !== userId);

			// 남은 유저들에게 '누가 나갔는지' 알림 패킷 생성
			const notificationPacket = userLeftNotificationPacketForm({ userId: userId });
			// 남은 유저들에게 알림 전송
			broadcastDataToRoom(remainingUsers, notificationPacket, GamePacketType.leaveRoomNotification);

			// 요청자에게 성공 응답 반환
			return leaveRoomResponsePacketForm({
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
		return leaveRoomResponsePacketForm({
			success: false,
			failCode: GlobalFailCode.UNKNOWN_ERROR,
		});
	}
};
