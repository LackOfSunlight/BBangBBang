import { GameSocket } from '../type/game.socket.js';
import { GamePacket } from '../generated/gamePacket.js';
import { getGamePacketType } from '../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType.js';
import { registerUseCase } from '../useCase/register/register.usecase.js';
import { sendData } from '../utils/send.data.js';

const registerHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.registerRequest);
	if (!payload) return; // payload 없으면 종료

	const req = payload.registerRequest;

	const res = await registerUseCase(socket, req);

	sendData(socket, res, GamePacketType.registerResponse);
};

export default registerHandler;
