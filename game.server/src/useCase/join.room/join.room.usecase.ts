import { GamePacket } from '../../generated/gamePacket';
import { C2SJoinRoomRequest } from '../../generated/packet/room_actions';
import { GameSocket } from '../../Type/game.socket';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacketType } from '../../Enums/gamePacketType';
import { getUserByUserId } from '../../Services/prisma.service';
import { RoomStateType } from '../../generated/common/enums';
import { User } from '../../Models/user.model';
import { broadcastDataToRoom } from '../../Sockets/notification';
import { joinRoomNotificationForm, joinRoomResponseForm } from '../../Converter/packet.form';
import roomManager from '../../Managers/room.manager';

const joinRoomUseCase = async (
	socket: GameSocket,
	req: C2SJoinRoomRequest,
): Promise<GamePacket> => {
	try {
		// 1. 유저 정보 조회
		const userInfo = await getUserByUserId(Number(socket.userId));
		if (!userInfo) {
			return joinRoomResponseForm(false, GlobalFailCode.CHARACTER_NOT_FOUND);
		}

		// 2. 방 조회
		const room = roomManager.getRoom(req.roomId);
		if (!room) {
			return joinRoomResponseForm(false, GlobalFailCode.ROOM_NOT_FOUND);
		}

		// 3. 입장 조건 검증
		if (room.users.length >= room.maxUserNum) {
			return joinRoomResponseForm(false, GlobalFailCode.JOIN_ROOM_FAILED);
		}
		if (room.state !== RoomStateType.WAIT) {
			return joinRoomResponseForm(false, GlobalFailCode.JOIN_ROOM_FAILED);
		}

		// 4. 유저를 방에 추가
		const user = new User(socket.userId!, userInfo.nickname);
		roomManager.addUserToRoom(req.roomId, user);
		socket.roomId = req.roomId;

		const toUser = user.toData();
		const toRoom = room.toData();

		// 5. 방 참여 알림 브로드캐스트
		const notificationPacket = joinRoomNotificationForm(toUser);
		broadcastDataToRoom(toRoom.users, notificationPacket, GamePacketType.joinRoomNotification);

		// 6. 성공 응답
		return joinRoomResponseForm(true, GlobalFailCode.NONE_FAILCODE, room);
	} catch (error) {
		return joinRoomResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
	}
};

export default joinRoomUseCase;
