import { GameSocket } from '../../type/game.socket.js';
import { S2CUseCardResponse } from '../../generated/packet/game_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { GlobalFailCode } from '../../generated/common/enums.js';
import { sendData } from '../../utils/send.data.js';

const useCardResponseHandler = (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.useCardResponse);
	if (!payload) return;
	const res = payload.useCardResponse;

	if (res.success) console.log(`카드 사용에 성공하였습니다.`);
	else console.log(`카드 사용에 실패하였습니다.[${res.failCode}]`);
	sendData(socket, gamePacket, GamePacketType.useCardResponse);
};

export default useCardResponseHandler;
