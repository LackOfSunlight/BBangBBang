import { GamePacketType, gamePackTypeSelect } from '../Enums/gamePacketType';
import { GamePacket } from '../generated/gamePacket';
import { GameSocket } from '../Type/game.socket';
import { gameStartUseCase } from '../UseCase/Game.start/game.start.usecase';
import { sendData } from '../Sockets/send.data';
import { getGamePacketType } from '../Converter/type.form';

const gameStartHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.gameStartRequest);
	if (!payload) return;

	const req = payload.gameStartRequest;

	const res = await gameStartUseCase(socket, req);

	sendData(socket, res, GamePacketType.gameStartResponse);
};

export default gameStartHandler;
