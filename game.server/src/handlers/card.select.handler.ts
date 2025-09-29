import { GamePacketType, gamePackTypeSelect } from '../Enums/gamePacketType';
import { GamePacket } from '../Generated/gamePacket';
import { GameSocket } from '../Type/game.socket';
import { cardSelectUseCase } from '../UseCase/Card.select/card.select.usecase';
import { sendData } from '../Sockets/send.data';
import { getGamePacketType } from '../Converter/type.form';

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
