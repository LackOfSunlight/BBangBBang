import { GamePacketType, gamePackTypeSelect } from '@game/enums/gamePacketType';
import { GamePacket } from '@core/generated/gamePacket';
import { GameSocket } from '@common/types/game.socket';
import { gamePrepareUseCase } from '@game/usecases/game.prepare/game.prepare.usecase';
import { sendData } from '@core/network/sockets/send.data';
import { getGamePacketType } from '@common/converters/type.form';

const gamePrepareHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.gamePrepareRequest);
	if (!payload) return;

	const req = payload.gamePrepareRequest;

	const res = await gamePrepareUseCase(socket, req);

	sendData(socket, res, GamePacketType.gamePrepareResponse);
};

export default gamePrepareHandler;
