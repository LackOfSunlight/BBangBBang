import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { GlobalFailCode } from '../../generated/common/enums.js';
import { Room } from '../../models/room.model.js';
import { addUserToRoom, getRoom } from '../../utils/redis.util.js';
import { User } from '../../models/user.model.js';
import { prisma } from '../../utils/db.js';
import joinRoomResponseHandler from '../response/join.room.response.handler.js';
import { RoomStateType } from '../../generated/common/enums.js';
import joinRoomNotificationHandler from '../notification/join.room.notification.handler.js';
import { setJoinRoomNotification } from '../notification/join.room.notification.handler.js';

const joinRoomRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.joinRoomRequest);

	if (!payload || !socket.userId) return;

	const req = payload.joinRoomRequest;

	const userInfo = await prisma.user.findUnique({
		where: { id: Number(socket.userId) },
		select: {
			nickname: true,
		},
	});

	if (!userInfo) return;

	const user: User = new User(socket.userId, userInfo.nickname);
  const room:Room|null = await getRoom(req.roomId);

  if(room?.maxUserNum === room?.users.length)
    return joinRoomResponseHandler(socket, setJoinRoomResponse(false, GlobalFailCode.JOIN_ROOM_FAILED));

  if(room?.state != RoomStateType.WAIT)
    return joinRoomResponseHandler(socket, setJoinRoomResponse(false, GlobalFailCode.JOIN_ROOM_FAILED));

  await addUserToRoom(req.roomId, user);

  socket.roomId = room.id;

  joinRoomResponseHandler(socket, setJoinRoomResponse(true,  GlobalFailCode.NONE_FAILCODE, room));

  joinRoomNotificationHandler(socket, setJoinRoomNotification(user));
};

const setJoinRoomResponse = (success: boolean, failCode: GlobalFailCode, room?: Room) : GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.joinRoomResponse,
			joinRoomResponse: {
				success,
				room,
				failCode,
			},
		},
	};

  return newGamePacket;
};

export default joinRoomRequestHandler;
