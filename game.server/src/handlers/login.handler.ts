import { GameSocket } from '../type/game.socket.js';
import { GamePacket } from '../generated/gamePacket.js';
import { getGamePacketType } from '../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType.js';
import loginUseCase from '../useCase/login/login.usecase.js';
import { sendData } from '../utils/send.data.js';
import { getRoom } from '../utils/room.utils.js';
import { Room } from '../models/room.model.js';

const loginRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.loginRequest);
	if (!payload) return;

	const req = payload.loginRequest;

	const res = await loginUseCase(socket, req);

	sendData(socket, res, GamePacketType.loginResponse);
};

export default loginRequestHandler;
