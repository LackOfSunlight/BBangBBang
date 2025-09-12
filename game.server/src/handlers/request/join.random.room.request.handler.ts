import { GameSocket } from '../../type/game.socket.js';
import { C2SJoinRandomRoomRequest } from '../../generated/packet/room_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { addUserToRoom, getRoom, getRooms } from '../../utils/redis.util.js';
import { Room } from '../../models/room.model.js';
import { User } from '../../models/user.model.js';
import { prisma } from '../../utils/db.js';
import { GlobalFailCode } from '../../generated/common/enums.js';
import joinRandomRoomResponseHandler from '../response/join.random.room.response.handler.js';
import joinRoomNotificationHandler from '../notification/join.room.notification.handler.js';
import { setJoinRoomNotification } from '../notification/join.room.notification.handler.js';

const joinRandomRoomRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.joinRandomRoomRequest);

	if (!payload || !socket.userId) return;

	const userInfo = await prisma.user.findUnique({
		where: { id: Number(socket.userId) },
	});

	if (!userInfo) return;

	const rooms: Room[] = await getRooms();
	let selectedRoom: Room | null = null;

	const availableRooms = rooms.filter((room) => room.users.length < room.maxUserNum);

	let roomId: number | null = null;
	let selectUser: User | null = null;

	if (availableRooms.length > 0) {
		const randomIndex = Math.floor(Math.random() * availableRooms.length);
		const room = availableRooms[randomIndex];

		const user = new User(socket.userId, userInfo.nickname);
		selectUser = user;
		roomId = room.id;

		socket.roomId = roomId;
		selectedRoom = await addUserToRoom(room.id, user);
	} else {
		return joinRandomRoomResponseHandler(
			socket,
			setJoinRandomRoomResponse(false, GlobalFailCode.JOIN_ROOM_FAILED),
		);
	}

	if (selectedRoom != null) {
		joinRandomRoomResponseHandler(
			socket,
			setJoinRandomRoomResponse(true, GlobalFailCode.NONE_FAILCODE, selectedRoom),
		);

		joinRoomNotificationHandler(socket, setJoinRoomNotification(selectUser));
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

export default joinRandomRoomRequestHandler;
