import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { sendData } from '../../utils/send.data.js';
import { GlobalFailCode } from '../../generated/common/enums.js';

const leaveRoomResponseHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.leaveRoomResponse);
	if (!payload) return;

	const res = payload.leaveRoomResponse;

	const responsePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.leaveRoomResponse,
			leaveRoomResponse: {
				success: true,
				failCode: GlobalFailCode.NONE_FAILCODE,
			},
		},
	};
	sendData(socket, responsePacket, GamePacketType.leaveRoomResponse);
};

export default leaveRoomResponseHandler;
