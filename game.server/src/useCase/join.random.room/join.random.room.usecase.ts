import { GamePacket } from '../../generated/gamePacket';
import { C2SJoinRandomRoomRequest } from '../../generated/packet/room_actions';
import { GameSocket } from '../../type/game.socket';
import { Room } from '../../models/room.model';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacketType } from '../../enums/gamePacketType';
import { getUserByUserId } from '../../services/prisma.service';
import { addUserToRoom, getRoom, getRooms } from '../../utils/room.utils';
import { User } from '../../models/user.model';
import { broadcastDataToRoom } from '../../utils/notification.util';

const joinRandomRoomUseCase = async (
	socket: GameSocket,
	req: C2SJoinRandomRoomRequest,
): Promise<GamePacket> => {
	let userInfo;
	let room;

	try {
		userInfo = await getUserByUserId(Number(socket.userId));
	} catch (err) {
		console.log(`DB 에러 발생: ${err}`);
		return setJoinRandomRoomResponse(false, GlobalFailCode.JOIN_ROOM_FAILED);
	}

	if (userInfo) {
		const rooms: Room[] = getRooms();

		const availableRooms = rooms.filter((room) => room.users.length < room.maxUserNum);

		if (availableRooms.length > 0) {
			const randomIndex = Math.floor(Math.random() * availableRooms.length);
			room = availableRooms[randomIndex];

			const user = new User(socket.userId!, userInfo.nickname);

			addUserToRoom(room.id, user);

			const notificationPacket = setJoinRoomNotification(user);

			broadcastDataToRoom(room.users, notificationPacket, GamePacketType.joinRoomNotification);
			return setJoinRandomRoomResponse(true, GlobalFailCode.NONE_FAILCODE, room);
		} else {
			return setJoinRandomRoomResponse(false, GlobalFailCode.JOIN_ROOM_FAILED);
		}
	} else {
		return setJoinRandomRoomResponse(false, GlobalFailCode.JOIN_ROOM_FAILED);
	}
};

const setJoinRandomRoomResponse = (
	success: boolean,
	failCode: GlobalFailCode,
	room?: Room,
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.joinRandomRoomResponse,
			joinRandomRoomResponse: {
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

export default joinRandomRoomUseCase;
