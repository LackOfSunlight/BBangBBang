import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket.js';
import { getGamePacketType } from '../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType.js';
import destroyCardUseCase from '../useCase/destroy.card/destroy.card.usecase';
import { sendData } from '../utils/send.data.js';

const destroyCardRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.destroyCardRequest);

	if (!payload || !socket.userId || !socket.roomId) {
		console.log('소켓과 패킷이 전달되지 않았습니다.');
		return;
	}

	const req = payload.destroyCardRequest;

	const res = await destroyCardUseCase(socket, req);

	sendData(socket, res, GamePacketType.destroyCardResponse);
};

export default destroyCardRequestHandler;
