import { GameSocket } from '../../type/game.socket.js';
import { S2CDestroyCardResponse } from '../../generated/packet/game_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { send } from 'process';
import { sendData } from '../../utils/send.data.js';
import { GamePacketType } from '../../enums/gamePacketType.js';

const destroyCardResponseHandler = (socket: GameSocket, gamePacket: GamePacket) => {

    sendData(socket, gamePacket, GamePacketType.destroyCardResponse);
};

export default destroyCardResponseHandler;
