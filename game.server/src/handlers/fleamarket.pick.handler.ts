import { GameSocket } from '../Type/game.socket';
import { GamePacket } from '../Generated/gamePacket.js';
import { getGamePacketType } from '../Converter/type.form.js';
import { GamePacketType, gamePackTypeSelect } from '../Enums/gamePacketType.js';
import { sendData } from '../Sockets/send.data.js';
import fleaMarketPickUseCase from '../UseCase/Fleamarket.pick/fleamarket.pick.usecase';

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
