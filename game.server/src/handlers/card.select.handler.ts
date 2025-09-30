import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import { GamePacket } from '../generated/gamePacket';
import { GameSocket } from '../type/game.socket';
import { cardSelectUseCase } from '../useCase/card.select/card.select.usecase';
import { sendData } from '../sockets/send.data';
import { getGamePacketType } from '../converter/type.form';

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
