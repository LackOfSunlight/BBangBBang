import { GamePacket } from '../../generated/gamePacket';
import { C2SJoinRoomRequest } from '../../generated/packet/room_actions';
import { GameSocket } from '../../type/game.socket';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacketType } from '../../enums/gamePacketType';
import { getUserByUserId } from '../../services/prisma.service';
import { RoomStateType } from '../../generated/common/enums';
import { User } from '../../models/user.model';
import { broadcastDataToRoom } from '../../utils/notification.util';
import { joinRoomNotificationForm, joinRoomResponseForm } from '../../factory/packet.pactory';
import { getRoom, addUserToRoom } from '../../utils/room.utils';

const joinRoomUseCase = async (
	socket: GameSocket,
	req: C2SJoinRoomRequest,
): Promise<GamePacket> => {
	let userInfo;
	let room;

	try {
		userInfo = await getUserByUserId(Number(socket.userId));
		room = getRoom(req.roomId);
	} catch (err) {
		console.log(`DB 에러 발생: ${err}`);
		return joinRoomResponseForm(false, GlobalFailCode.JOIN_ROOM_FAILED);
	}

	if (userInfo && room) {
		if (room.users.length >= room.maxUserNum || room.state !== RoomStateType.WAIT) {
			return joinRoomResponseForm(false, GlobalFailCode.JOIN_ROOM_FAILED);
		}

		const user = new User(socket.userId!, userInfo.nickname);

		addUserToRoom(req.roomId, user);

		socket.roomId = req.roomId;

		const notificationPacket = joinRoomNotificationForm(user);

		broadcastDataToRoom(room.users, notificationPacket, GamePacketType.joinRoomNotification);
		return joinRoomResponseForm(true, GlobalFailCode.NONE_FAILCODE, room);
	} else {
		return joinRoomResponseForm(false, GlobalFailCode.JOIN_ROOM_FAILED);
	}
};

export default joinRoomUseCase;
