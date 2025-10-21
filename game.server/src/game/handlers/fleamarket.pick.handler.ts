import { GameSocket } from '@common/types/game.socket';
import { GamePacket } from '@core/generated/gamePacket.js';
import { getGamePacketType } from '@common/converters/type.form.js';
import { GamePacketType, gamePackTypeSelect } from '@game/enums/gamePacketType.js';
import { sendData } from '@core/network/sockets/send.data.js';
import fleaMarketPickUseCase from '@game/usecases/fleamarket.pick/fleamarket.pick.usecase';

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
