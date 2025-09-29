import { GamePacketType, gamePackTypeSelect } from '../Enums/gamePacketType';
import { GamePacket } from '../generated/gamePacket';
import { GameSocket } from '../Type/game.socket';
import { gamePrepareUseCase } from '../UseCase/Game.prepare/game.prepare.usecase';
import { sendData } from '../Sockets/send.data';
import { getGamePacketType } from '../Converter/type.form';

const gamePrepareHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.gamePrepareRequest);
	if (!payload) return;

	const req = payload.gamePrepareRequest;

	const res = await gamePrepareUseCase(socket, req);

	sendData(socket, res, GamePacketType.gamePrepareResponse);
};

export default gamePrepareHandler;
