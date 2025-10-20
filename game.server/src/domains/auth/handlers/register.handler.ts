import { GameSocket } from '../../../type/game.socket';
import { GamePacket } from '../../../generated/gamePacket';
import { getGamePacketType } from '../../../converter/type.form';
import { GamePacketType, gamePackTypeSelect } from '../../../enums/gamePacketType';
import { registerUseCase } from '../../../useCase/register/register.usecase';
import { sendData } from '../../../sockets/send.data';

const newRegisterHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.registerRequest);
	if (!payload) return; // payload 없으면 종료

	const req = payload.registerRequest;

	const res = await registerUseCase(socket, req);

	sendData(socket, res, GamePacketType.registerResponse);
};

export default newRegisterHandler;
