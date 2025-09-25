import { GamePacket } from '../../generated/gamePacket';
import { C2SJoinRandomRoomRequest } from '../../generated/packet/room_actions';
import { GameSocket } from '../../type/game.socket';
import { Room } from '../../models/room.model';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacketType } from '../../enums/gamePacketType';
import { getUserByUserId } from '../../services/prisma.service';
import { User } from '../../models/user.model';
import { broadcastDataToRoom } from '../../sockets/notification';
import { joinRandomRoomResponseForm, joinRoomNotificationForm } from '../../converter/packet.form';
import roomManger from '../../managers/room.manger';

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
		return joinRandomRoomResponseForm(false, GlobalFailCode.JOIN_ROOM_FAILED);
	}

	if (userInfo) {
		const rooms: Room[] = roomManger.getRooms();

		const availableRooms = rooms.filter((room) => room.users.length < room.maxUserNum);

		if (availableRooms.length > 0) {
			const randomIndex = Math.floor(Math.random() * availableRooms.length);
			room = availableRooms[randomIndex];

			const user = new User(socket.userId!, userInfo.nickname);

			roomManger.addUserToRoom(room.id, user);

			socket.roomId = room.id;

			const notificationPacket = joinRoomNotificationForm(user);

			broadcastDataToRoom(room.users, notificationPacket, GamePacketType.joinRoomNotification);
			return joinRandomRoomResponseForm(true, GlobalFailCode.NONE_FAILCODE, room);
		} else {
			return joinRandomRoomResponseForm(false, GlobalFailCode.JOIN_ROOM_FAILED);
		}
	} else {
		return joinRandomRoomResponseForm(false, GlobalFailCode.JOIN_ROOM_FAILED);
	}
};

export default joinRandomRoomUseCase;
