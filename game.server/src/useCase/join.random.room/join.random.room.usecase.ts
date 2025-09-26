import { GamePacket } from '../../generated/gamePacket';
import { C2SJoinRandomRoomRequest } from '../../generated/packet/room_actions';
import { GameSocket } from '../../type/game.socket';
import { Room } from '../../models/room.model';
import { GlobalFailCode, RoomStateType } from '../../generated/common/enums';
import { GamePacketType } from '../../enums/gamePacketType';
import { getUserByUserId } from '../../services/prisma.service';
import { User } from '../../models/user.model';
import { broadcastDataToRoom } from '../../sockets/notification';
import { joinRandomRoomResponseForm, joinRoomNotificationForm } from '../../converter/packet.form';
import roomManger from '../../managers/room.manager';

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

		const notificationPacket = joinRoomNotificationForm(user);

		broadcastDataToRoom(room.users, notificationPacket, GamePacketType.joinRoomNotification);

		return joinRandomRoomResponseForm(true, GlobalFailCode.NONE_FAILCODE, room);
	} catch (err) {
		return joinRandomRoomResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
	}
};

export default joinRandomRoomUseCase;
