import { GameSocket } from '@common/types/game.socket.js';
import { C2SGetRoomListRequest } from '@core/generated/packet/room_actions.js';
import { GamePacket } from '@core/generated/gamePacket.js';
import { getRoomListResponseForm } from '@common/converters/packet.form.js';
import roomManger from '@game/managers/room.manager.js';
// RoomService 제거

const getRoomListUseCase = (socket: GameSocket, req: C2SGetRoomListRequest): GamePacket => {
	const rooms = roomManger.getRooms();

	return getRoomListResponseForm(rooms);
};

export default getRoomListUseCase;
