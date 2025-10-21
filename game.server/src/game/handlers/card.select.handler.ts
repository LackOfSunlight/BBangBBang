import { GamePacketType, gamePackTypeSelect } from '@game/enums/gamePacketType';
import { GamePacket } from '@core/generated/gamePacket';
import { GameSocket } from '@common/types/game.socket';
import { cardSelectUseCase } from '@game/usecases/card.select/card.select.usecase';
import { sendData } from '@core/network/sockets/send.data';
import { getGamePacketType } from '@common/converters/type.form';

const cardSelectHandler = (socket: GameSocket, gamePacket: GamePacket): void => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.cardSelectRequest);

	if (!payload || !socket.userId || !socket.roomId) {
		return;
	}

	const req = payload.cardSelectRequest;
	const res = cardSelectUseCase(socket, req);

	sendData(socket, res, GamePacketType.cardSelectResponse);
};

export default cardSelectHandler;
