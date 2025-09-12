import { GameSocket } from '../../type/game.socket.js';
import { S2CGameStartResponse } from '../../generated/packet/game_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { sendData } from '../../utils/send.data.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { getGamePacketType } from '../../utils/type.converter.js';

const gameStartResponseHandler = (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.gameStartResponse);

	if (!payload) return;

	const res = payload.gameStartResponse;

	if (res.success) {
		console.log('게임 시작!');
	} else {
		console.log('게임 사직을 실패하였습니다.');
	}

	sendData(socket, gamePacket, GamePacketType.gameStartResponse);
};

export default gameStartResponseHandler;
