import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import { GamePacket } from '../generated/gamePacket';
import { GameSocket } from '../type/game.socket';
import { cardSelectUseCase } from '../useCase/card.select/card.select.usecase';
import { sendData } from '../utils/send.data';
import { getGamePacketType } from '../utils/type.converter';

const cardSelectHandler = (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.cardSelectRequest);

	if (!payload || !socket.userId || !socket.roomId) {
		console.error('소켓과 패킷이 전달되지 않았습니다.');
		return;
	}

	const req = payload.cardSelectRequest;
	const res = cardSelectUseCase(socket, req);

	sendData(socket, res, GamePacketType.cardSelectResponse);
};

export default cardSelectHandler;
