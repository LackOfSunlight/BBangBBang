import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import { GamePacket } from '../generated/gamePacket';
import { GameSocket } from '../type/game.socket';
import { gameStartUseCase } from '../useCase/game.start/game.start.usecase';
import { sendData } from '../sockets/send.data';
import { getGamePacketType } from '../converter/type.form';

const gameStartHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.gameStartRequest);
	if (!payload) return;

	const req = payload.gameStartRequest;

	const res = await gameStartUseCase(socket, req);

	sendData(socket, res, GamePacketType.gameStartResponse);
};

export default gameStartHandler;
