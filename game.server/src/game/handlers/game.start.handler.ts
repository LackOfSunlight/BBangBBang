import { GamePacketType, gamePackTypeSelect } from '@game/enums/gamePacketType';
import { GamePacket } from '@core/generated/gamePacket';
import { GameSocket } from '@common/types/game.socket';
import { gameStartUseCase } from '@game/usecases/game.start/game.start.usecase';
import { sendData } from '@core/network/sockets/send.data';
import { getGamePacketType } from '@common/converters/type.form';

const gameStartHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.gameStartRequest);
	if (!payload) return;

	const req = payload.gameStartRequest;

	const res = await gameStartUseCase(socket, req);

	sendData(socket, res, GamePacketType.gameStartResponse);
};

export default gameStartHandler;
