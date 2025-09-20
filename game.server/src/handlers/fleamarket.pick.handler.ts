import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../utils/type.converter';
import { gamePackTypeSelect } from '../enums/gamePacketType';

const fleaMarketPickHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.fleaMarketPickRequest);

	if (!payload || !socket.userId || !socket.roomId) {
		console.log('소켓과 패킷이 전달되지 않았습니다.');
		return;
	}

	const req = payload.fleaMarketPickRequest;

};

export default fleaMarketPickHandler;
