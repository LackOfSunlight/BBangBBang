import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../utils/type.converter';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import createRoomUseCase from '../useCase/create.room/create.room.usecase';
import { sendData } from '../utils/send.data';

const createRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.createRoomRequest);
	if (!payload || !socket.userId) return;

	const req = payload.createRoomRequest;

	const res = await createRoomUseCase(socket, req);

	sendData(socket, res, GamePacketType.createRoomResponse);
};

export default createRoomHandler;
