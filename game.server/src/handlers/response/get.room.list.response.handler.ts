import { GameSocket } from '../../type/game.socket.js';
import { S2CGetRoomListResponse } from '../../generated/packet/room_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { send } from 'process';
import { sendData } from '../../utils/send.data.js';

const getRoomListResponseHandler = (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.getRoomListResponse);
	if (!payload) {
		console.log('룸리스트 전송 실패');
		return;
	}

	console.log('룸리스트 전송');

	sendData(socket, gamePacket, GamePacketType.getRoomListResponse);
};

export default getRoomListResponseHandler;
