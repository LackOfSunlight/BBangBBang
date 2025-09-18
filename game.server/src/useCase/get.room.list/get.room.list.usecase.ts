import { GameSocket } from '../../type/game.socket.js';
import { C2SGetRoomListRequest } from '../../generated/packet/room_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { getRooms } from '../../utils/room.utils.js';
import { Room } from '../../models/room.model.js';

const getRoomListUseCase = (socket: GameSocket, req: C2SGetRoomListRequest): GamePacket => {

	const rooms = getRooms();

	return setGetRoomListResponse(rooms);
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

export default getRoomListUseCase;
