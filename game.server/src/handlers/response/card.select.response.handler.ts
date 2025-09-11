import { GameSocket } from '../../type/game.socket.js';
import { S2CCardSelectResponse } from '../../generated/packet/game_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';

const cardSelectResponseHandler = (socket: GameSocket, gamePacket: GamePacket) => {};

export default cardSelectResponseHandler;
