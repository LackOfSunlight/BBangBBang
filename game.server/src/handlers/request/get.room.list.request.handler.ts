import { GameSocket } from '../../type/game.socket.js';
import { C2SGetRoomListRequest } from '../../generated/packet/room_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { getRooms } from '../../utils/redis.util.js';
import { Room } from '../../models/room.model.js';
import getRoomListResponseHandler from '../response/get.room.list.response.handler.js';

const getRoomListRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.getRoomListRequest);

	if (!payload || !socket.userId) return;

	const rooms = await getRooms();

	getRoomListResponseHandler(socket, setGetRoomListResponse(rooms));
};

const setGetRoomListResponse = (rooms: Room[]): GamePacket => {
	const newGamaPacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.getRoomListResponse,
			getRoomListResponse: {
				rooms,
			},
		},
	};

	return newGamaPacket;
};

export default getRoomListRequestHandler;
