import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../utils/type.converter';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import loginUseCase from '../useCase/login/login.usecase';
import { sendData } from '../utils/send.data';

const loginHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.loginRequest);
	if (!payload) return;

	const req = payload.loginRequest;

	const res = await loginUseCase(socket, req);

	sendData(socket, res, GamePacketType.loginResponse);
};

export default loginHandler;
