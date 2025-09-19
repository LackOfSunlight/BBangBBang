import { GameSocket } from '../type/game.socket.js';
import { GamePacket } from '../generated/gamePacket.js';
import { getGamePacketType } from '../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType.js';
import createRoomUseCase from '../useCase/create.room/create.room.usecase.js';
import { sendData } from '../utils/send.data.js';

const createRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.createRoomRequest);
	if (!payload || !socket.userId) return;

	const req = payload.createRoomRequest;

	const res = await createRoomUseCase(socket, req);

	sendData(socket, res, GamePacketType.createRoomResponse);
};

export default createRoomHandler;
