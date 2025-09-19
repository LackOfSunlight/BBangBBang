import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import { GamePacket } from '../generated/gamePacket';
import { GameSocket } from '../type/game.socket';
import { gamePrepareUseCase } from '../useCase/game.prepare/game.prepare.usecase';
import { sendData } from '../utils/send.data';
import { getGamePacketType } from '../utils/type.converter';

const gamePrepareHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.gamePrepareRequest);
	if (!payload) return;

	const req = payload.gamePrepareRequest;

	const res = await gamePrepareUseCase(socket, req);

	sendData(socket, res, GamePacketType.gamePrepareResponse);
};

export default gamePrepareHandler;
