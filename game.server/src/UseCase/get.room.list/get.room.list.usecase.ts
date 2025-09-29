import { GameSocket } from '../../Type/game.socket.js';
import { C2SGetRoomListRequest } from '../../Generated/packet/room_actions.js';
import { GamePacket } from '../../Generated/gamePacket.js';
import { getRoomListResponseForm } from '../../Converter/packet.form.js';
import roomManger from '../../Managers/room.manager.js';

const getRoomListUseCase = (socket: GameSocket, req: C2SGetRoomListRequest): GamePacket => {
	const rooms = roomManger.getRooms();

	return getRoomListResponseForm(rooms);
};

export default getRoomListUseCase;
