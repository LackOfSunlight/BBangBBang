import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket.js';
import { getGamePacketType } from '../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType.js';
import { sendData } from '../utils/send.data.js';
import fleaMarketPickUseCase from '../useCase/fleamarket.pick/fleamarket.pick.usecase';

const fleaMarketPickHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.fleaMarketPickRequest);

	if (!payload || !socket.userId || !socket.roomId) {
		console.log('소켓과 패킷이 전달되지 않았습니다.');
		return;
	}

	const req = payload.fleaMarketPickRequest;

	const res = fleaMarketPickUseCase(socket, req);

	sendData(socket, res, GamePacketType.fleaMarketPickResponse);

};

export default fleaMarketPickHandler;
