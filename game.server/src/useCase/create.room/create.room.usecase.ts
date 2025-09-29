import { C2SCreateRoomRequest } from '../../generated/packet/room_actions';
import { GameSocket } from '../../type/game.socket';
import { GamePacket } from '../../generated/gamePacket.js';
import { GlobalFailCode, RoomStateType as StateType } from '../../generated/common/enums.js';
import { Room } from '../../models/room.model.js';
import { RoomStateType } from '../../generated/common/enums.js';
import { User } from '../../models/user.model.js';
import { createRoomDB, getUserByUserId } from '../../services/prisma.service.js';
import { createRoomResponseForm } from '../../converter/packet.form';
import roomManger from '../../managers/room.manager';

const createRoomUseCase = async (
	socket: GameSocket,
	req: C2SCreateRoomRequest,
): Promise<GamePacket> => {
	try {
		if (!req.name || !socket.userId)
			return createRoomResponseForm(false, GlobalFailCode.CREATE_ROOM_FAILED);

		const roomDB = await createRoomDB(socket, req);
		const userInfo = await getUserByUserId(Number(socket.userId));

		if (!roomDB || !userInfo)
			return createRoomResponseForm(false, GlobalFailCode.CREATE_ROOM_FAILED);

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

		roomManger.saveRoom(room);

		const toRoom = room.toData();

		return createRoomResponseForm(true, GlobalFailCode.NONE_FAILCODE, toRoom);
	} catch (error) {
		return createRoomResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
	}
};

export default createRoomUseCase;
