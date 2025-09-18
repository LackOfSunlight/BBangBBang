import { GamePacketType } from '../../enums/gamePacketType';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { GameSocket } from '../../type/game.socket';
import { sendData } from '../../utils/send.data';

const leaveRoomResponseHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	sendData(socket, gamePacket, GamePacketType.leaveRoomResponse);
};

export default leaveRoomResponseHandler;
