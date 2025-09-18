import { C2SCreateRoomRequest } from '../../generated/packet/room_actions';
import { GameSocket } from '../../type/game.socket';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { RoomData } from '../../generated/common/types.js';
import { GlobalFailCode, RoomStateType as StateType } from '../../generated/common/enums.js';
import { Room } from '../../models/room.model.js';
import { prisma } from '../../utils/db.js';
import { RoomStateType } from '../../generated/common/enums.js';
import { User } from '../../models/user.model.js';
import { createRoomDB, getUserByUserId } from '../../services/prisma.service.js';
import { saveRoom } from '../../utils/room.utils';

const createRoomUseCase = async (
	socket: GameSocket,
	req: C2SCreateRoomRequest,
): Promise<GamePacket> => {
	let roomDB;
	let userInfo;

	if (!req.name || !socket.userId) {
		return setCreateResponse(false, GlobalFailCode.CREATE_ROOM_FAILED);
	}

	try {
		roomDB = await createRoomDB(socket, req);
		userInfo = await getUserByUserId(Number(socket.userId));
	} catch (err) {
		return setCreateResponse(false, GlobalFailCode.CREATE_ROOM_FAILED);
	}

	if (roomDB && userInfo) {
		const user: User = new User(socket.userId, userInfo.nickname);

		const room: Room = new Room(
			roomDB.id,
			socket.userId,
			req.name,
			req.maxUserNum,
			RoomStateType.WAIT,
			[user],
		);

		socket.roomId = room.id;

		saveRoom(room);

		return setCreateResponse(true, GlobalFailCode.NONE_FAILCODE, room);
	} else{
		return setCreateResponse(false, GlobalFailCode.CREATE_ROOM_FAILED);
	}
};

const setCreateResponse = (
	success: boolean,
	failCode: GlobalFailCode,
	room?: RoomData,
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.createRoomResponse,
			createRoomResponse: {
				success,
				room,
				failCode,
			},
		},
	};

	return newGamePacket;
};

export default createRoomUseCase;
