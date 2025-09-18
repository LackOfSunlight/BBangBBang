import { GameSocket } from '../../type/game.socket.js';
import { S2CGamePrepareResponse } from '../../generated/packet/game_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { sendData } from '../../utils/send.data.js';
import { GamePacketType } from '../../enums/gamePacketType.js';

const gamePrepareResponseHandler = (socket: GameSocket, gamePacket: GamePacket) => {
	sendData(socket, gamePacket, GamePacketType.gamePrepareResponse);
};

export default gamePrepareResponseHandler;
