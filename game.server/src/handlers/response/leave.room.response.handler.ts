import { GamePacketType } from "../../enums/gamePacketType";
import { GlobalFailCode } from "../../generated/common/enums";
import { GamePacket } from "../../generated/gamePacket";
import { GameSocket } from "../../type/game.socket";
import { sendData } from "../../utils/send.data";


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
