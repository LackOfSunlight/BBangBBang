import { GamePacket } from '@core/generated/gamePacket';
import { C2SJoinRandomRoomRequest } from '@core/generated/packet/room_actions';
import { GameSocket } from '@common/types/game.socket';
import { Room } from '@game/models/room.model';
import { GlobalFailCode, RoomStateType } from '@core/generated/common/enums';
import { GamePacketType } from '@game/enums/gamePacketType';
import { getUserByUserId } from '@game/services/prisma.service';
import { User } from '@game/models/user.model';
import { broadcastDataToRoom } from '@core/network/sockets/notification';
import { joinRandomRoomResponseForm, joinRoomNotificationForm } from '@common/converters/packet.form';
import roomManger from '@game/managers/room.manager';

const joinRandomRoomUseCase = async (
	socket: GameSocket,
	req: C2SJoinRandomRoomRequest,
): Promise<GamePacket> => {
	try {
		const userInfo = await getUserByUserId(Number(socket.userId));
		const rooms: Room[] = roomManger.getRooms();
		let room: Room;

		if (!userInfo) return joinRandomRoomResponseForm(false, GlobalFailCode.CHARACTER_NOT_FOUND);

		const availableRooms = rooms.filter(
			(room) => room.users.length < room.maxUserNum && room.state === RoomStateType.WAIT,
		);

		if (availableRooms.length <= 0)
			return joinRandomRoomResponseForm(false, GlobalFailCode.JOIN_ROOM_FAILED);

		const randomIndex = Math.floor(Math.random() * availableRooms.length);
		room = availableRooms[randomIndex];

		const user = new User(socket.userId!, userInfo.nickname);

		roomManger.addUserToRoom(room.id, user);

		socket.roomId = room.id;

		const toUser = user.toData();
		const toRoom = room.toData();

		const notificationPacket = joinRoomNotificationForm(toUser);

		broadcastDataToRoom(toRoom.users, notificationPacket, GamePacketType.joinRoomNotification);

		return joinRandomRoomResponseForm(true, GlobalFailCode.NONE_FAILCODE, toRoom);
	} catch (err) {
		return joinRandomRoomResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
	}
};

export default joinRandomRoomUseCase;
