import { GamePacket } from '../../generated/gamePacket';
import { C2SJoinRoomRequest } from '../../generated/packet/room_actions';
import { GameSocket } from '../../type/game.socket';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacketType } from '../../enums/gamePacketType';
import { Room } from '../../models/room.model';
import { getUserByUserId } from '../../services/prisma.service';
import { addUserToRoom, getRoom } from '../../utils/room.utils';
import { RoomStateType } from '../../generated/common/enums';
import { User } from '../../models/user.model';
import { broadcastDataToRoom } from '../../utils/notification.util';

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
		return setJoinRoomResponse(false, GlobalFailCode.JOIN_ROOM_FAILED);
	}

	if (userInfo && room) {
		if (room.users.length >= room.maxUserNum || room.state !== RoomStateType.WAIT) {
			return setJoinRoomResponse(false, GlobalFailCode.JOIN_ROOM_FAILED);
		}

		const user = new User(socket.userId!, userInfo.nickname);

		addUserToRoom(req.roomId, user);

		socket.roomId = req.roomId;

		const notificationPacket = setJoinRoomNotification(user);

		broadcastDataToRoom(room.users, notificationPacket, GamePacketType.joinRoomNotification);
		return setJoinRoomResponse(true, GlobalFailCode.NONE_FAILCODE, room);
	} else {
		return setJoinRoomResponse(false, GlobalFailCode.JOIN_ROOM_FAILED);
	}
};

const setJoinRoomResponse = (
	success: boolean,
	failCode: GlobalFailCode,
	room?: Room,
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.joinRoomResponse,
			joinRoomResponse: {
				success,
				room,
				failCode,
			},
		},
	};

	return newGamePacket;
};

const setJoinRoomNotification = (joinUser: User): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.joinRoomNotification,
			joinRoomNotification: {
				joinUser,
			},
		},
	};

	return newGamePacket;
};

export default joinRoomUseCase;
