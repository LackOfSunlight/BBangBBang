import { GameSocket } from '../../type/game.socket.js';
import { C2SGetRoomListRequest } from '../../generated/packet/room_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getRooms } from '../../utils/room.utils.js';
import { getRoomListResponseForm } from '../../factory/packet.pactory.js';
import roomManger from '../../managers/room.manger.js';

const getRoomListUseCase = (socket: GameSocket, req: C2SGetRoomListRequest): GamePacket => {
	const rooms = roomManger.getRooms();

	return getRoomListResponseForm(rooms);
};

export default getRoomListUseCase;
