import { GameSocket } from '@common/types/game.socket';
import { GamePacket } from '@core/generated/gamePacket';
import { getGamePacketType } from '@common/converters/type.form';
import { GamePacketType, gamePackTypeSelect } from '@game/enums/gamePacketType';
import loginUseCase from '@game/usecases/login/login.usecase';
import { sendData } from '@core/network/sockets/send.data';

const newLoginHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.loginRequest);
	if (!payload) return;

	const req = payload.loginRequest;

	const res = await loginUseCase(socket, req);

	sendData(socket, res, GamePacketType.loginResponse);
};

export default newLoginHandler;
