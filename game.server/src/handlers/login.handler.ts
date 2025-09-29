import { GameSocket } from '../Type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../Converter/type.form';
import { GamePacketType, gamePackTypeSelect } from '../Enums/gamePacketType';
import loginUseCase from '../UseCase/Login/login.usecase';
import { sendData } from '../Sockets/send.data';

const loginHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.loginRequest);
	if (!payload) return;

	const req = payload.loginRequest;

	const res = await loginUseCase(socket, req);

	sendData(socket, res, GamePacketType.loginResponse);
};

export default loginHandler;
