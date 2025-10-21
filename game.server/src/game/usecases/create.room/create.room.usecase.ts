import { C2SCreateRoomRequest } from '@core/generated/packet/room_actions';
import { GameSocket } from '@common/types/game.socket';
import { GamePacket } from '@core/generated/gamePacket.js';
import { GlobalFailCode, RoomStateType as StateType } from '@core/generated/common/enums.js';
import { Room } from '@game/models/room.model.js';
import { RoomStateType } from '@core/generated/common/enums.js';
import { User } from '@game/models/user.model.js';
import { createRoomDB, getUserByUserId } from '@game/services/prisma.service.js';
import { createRoomResponseForm } from '@common/converters/packet.form';
import roomManger from '@game/managers/room.manager';
// RoomService 제거: 엔티티 메서드 직접 사용

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
			[],
		);
		room.addUserToRoom(user);

		socket.roomId = room.id;

		roomManger.saveRoom(room);

		const toRoom = room.toData();

		return createRoomResponseForm(true, GlobalFailCode.NONE_FAILCODE, toRoom);
	} catch (error) {
		return createRoomResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
	}
};

export default createRoomUseCase;
