import { GameSocket } from '../../type/game.socket.js';
import { C2SCardSelectRequest } from '../../generated/packet/game_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { getGamePacketType } from '../../utils/type.converter.js';

const cardSelectRequestHandler = (socket: GameSocket, gamePacket: GamePacket) => {};

export default cardSelectRequestHandler;
