import { GameSocket } from '../../type/game.socket.js';
import { S2CJoinRoomResponse } from '../../generated/packet/room_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { sendData } from '../../utils/send.data.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { runInThisContext } from 'vm';

const joinRoomResponseHandler = (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.joinRoomResponse);

	if (!payload) {
		console.log('payload가 널입니다.');
		return;
	}

	if (payload.joinRoomResponse.success) {
		console.log(`방 참가 성공 ${socket.userId}`);
	} else {
		console.log(`방 참가 실패 ${socket.userId}`);
	}

	sendData(socket, gamePacket, GamePacketType.joinRoomResponse);
};

export default joinRoomResponseHandler;
