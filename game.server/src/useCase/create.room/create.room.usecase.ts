import { C2SCreateRoomRequest } from '../../generated/packet/room_actions';
import { GameSocket } from '../../type/game.socket';
import { GamePacket } from '../../generated/gamePacket.js';
import { GlobalFailCode, RoomStateType as StateType } from '../../generated/common/enums.js';
import { Room } from '../../models/room.model.js';
import { RoomStateType } from '../../generated/common/enums.js';
import { User } from '../../models/user.model.js';
import { createRoomDB, getUserByUserId } from '../../services/prisma.service.js';
import { createRoomResponseForm } from '../../converter/packet.form';

const createRoomUseCase = async (
	socket: GameSocket,
	req: C2SCreateRoomRequest,
): Promise<GamePacket> => {
	let roomDB;
	let userInfo;

	if (!req.name || !socket.userId) {
		return createRoomResponseForm(false, GlobalFailCode.CREATE_ROOM_FAILED);
	}

	try {
		roomDB = await createRoomDB(socket, req);
		userInfo = await getUserByUserId(Number(socket.userId));
	} catch (err) {
		return createRoomResponseForm(false, GlobalFailCode.CREATE_ROOM_FAILED);
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

		return createRoomResponseForm(true, GlobalFailCode.NONE_FAILCODE, room);
	} else {
		return createRoomResponseForm(false, GlobalFailCode.CREATE_ROOM_FAILED);
	}
};



export default createRoomUseCase;
