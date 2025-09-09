import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { GlobalFailCode } from '../../generated/common/enums.js';
import { Room } from '../../models/room.model.js';
import { addUserToRoom, getRoom, saveRoom, updateUserFromRoom } from '../../utils/redis.util.js';
import { User } from '../../models/user.model.js';
import { prisma } from '../../utils/db.js';
import joinRoomResponseHandler from '../response/join.room.response.handler.js';
import { RoomStateType } from '../../generated/common/enums.js';
import joinRoomNotificationHandler from '../notification/join.room.notification.handler.js';
import { setJoinRoomNotification } from '../notification/join.room.notification.handler.js';

const joinRoomRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.joinRoomRequest);
	if (!payload || !socket.userId) return;

	const { joinRoomRequest: req } = payload;

	// 유저 정보 조회
	const userInfo = await prisma.user.findUnique({
		where: { id: Number(socket.userId) },
		select: { nickname: true },
	});
	if (!userInfo) return;

	const user = new User(socket.userId, userInfo.nickname);

	// 방 정보 가져오기
	let room = await getRoom(req.roomId);
	if (!room) {
		return joinRoomResponseHandler(
			socket,
			setJoinRoomResponse(false, GlobalFailCode.JOIN_ROOM_FAILED),
		);
	}

	// 입장 불가 조건 체크
	if (room.users.length >= room.maxUserNum || room.state !== RoomStateType.WAIT) {
		return joinRoomResponseHandler(
			socket,
			setJoinRoomResponse(false, GlobalFailCode.JOIN_ROOM_FAILED),
		);
	}

	// 유저를 방에 추가
	room = await addUserToRoom(req.roomId, user);
	if (!room) {
		return joinRoomResponseHandler(
			socket,
			setJoinRoomResponse(false, GlobalFailCode.JOIN_ROOM_FAILED),
		);
	}

	// 방이 max면 방 상태를 준비로 변경
	if(room.maxUserNum === room.users.length){
		room.state = RoomStateType.PREPARE;
		await saveRoom(room);
		room = await  getRoom(room.id);
		if(!room){
			return joinRoomResponseHandler(socket, setJoinRoomResponse(false, GlobalFailCode.JOIN_ROOM_FAILED));
		}
	}

	socket.roomId = room.id;

	// 성공 응답 및 알림
	joinRoomResponseHandler(
		socket,
		setJoinRoomResponse(true, GlobalFailCode.NONE_FAILCODE, room),
	);
	joinRoomNotificationHandler(socket, setJoinRoomNotification(user));
};

const setJoinRoomResponse = (
	success: boolean,
	failCode: GlobalFailCode,
	room?: Room,
): GamePacket => {
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
