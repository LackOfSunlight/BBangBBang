import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { sendData } from '../../utils/send.data.js';
import { GlobalFailCode } from '../../generated/common/enums.js';

const leaveRoomResponseHandler = async (socket: GameSocket, failCode: GlobalFailCode) => {
	const success = failCode === GlobalFailCode.NONE_FAILCODE;
	const responsePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.leaveRoomResponse,
			leaveRoomResponse: {
				success: success,
				failCode: failCode,
			},
		},
	};
	sendData(socket, responsePacket, GamePacketType.leaveRoomResponse);
};

export default leaveRoomResponseHandler;
