import { GameSocket } from '../Type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../Converter/type.form';
import { GamePacketType, gamePackTypeSelect } from '../Enums/gamePacketType';
import { registerUseCase } from '../UseCase/register/register.usecase';
import { sendData } from '../Sockets/send.data';

const registerHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.registerRequest);
	if (!payload) return; // payload 없으면 종료

	const req = payload.registerRequest;

	const res = await registerUseCase(socket, req);

	sendData(socket, res, GamePacketType.registerResponse);
};

export default registerHandler;
