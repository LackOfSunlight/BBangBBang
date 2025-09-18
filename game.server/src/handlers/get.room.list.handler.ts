import { GameSocket } from '../type/game.socket.js';
import { GamePacket } from '../generated/gamePacket.js';
import { getGamePacketType } from '../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType.js';
import { sendData } from '../utils/send.data.js';
import getRoomListUseCase from '../useCase/get.room.list/get.room.list.usecase.js';

const getRoomListHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.getRoomListRequest);

	if (!payload || !socket.userId) return;

    const req = payload.getRoomListRequest;

	const res = getRoomListUseCase(socket,req);

    sendData(socket, res, GamePacketType.getRoomListResponse);

};

export default getRoomListHandler;
