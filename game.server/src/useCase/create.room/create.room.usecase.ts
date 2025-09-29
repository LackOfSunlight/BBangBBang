import { C2SCreateRoomRequest } from '../../Generated/packet/room_actions';
import { GameSocket } from '../../Type/game.socket';
import { GamePacket } from '../../Generated/gamePacket.js';
import { GlobalFailCode, RoomStateType as StateType } from '../../Generated/common/enums.js';
import { Room } from '../../Models/room.model.js';
import { RoomStateType } from '../../Generated/common/enums.js';
import { User } from '../../Models/user.model.js';
import { createRoomDB, getUserByUserId } from '../../Services/prisma.service.js';
import { createRoomResponseForm } from '../../Converter/packet.form';
import roomManger from '../../Managers/room.manager';

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
