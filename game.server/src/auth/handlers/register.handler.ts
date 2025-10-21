import { GameSocket } from '@common/types/game.socket';
import { GamePacket } from '@core/generated/gamePacket';
import { getGamePacketType } from '@common/converters/type.form';
import { GamePacketType, gamePackTypeSelect } from '@game/enums/gamePacketType';
import { registerUseCase } from '@game/usecases/register/register.usecase';
import { sendData } from '@core/network/sockets/send.data';

const newRegisterHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.registerRequest);
	if (!payload) return; // payload 없으면 종료

	const req = payload.registerRequest;

	const res = await registerUseCase(socket, req);

	sendData(socket, res, GamePacketType.registerResponse);
};

export default newRegisterHandler;
