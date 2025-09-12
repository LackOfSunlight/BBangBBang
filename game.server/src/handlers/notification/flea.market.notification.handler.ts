import { GameSocket } from '../../type/game.socket.js';
import { S2CFleaMarketNotification } from '../../generated/packet/notifications.js';
import { GamePacket } from '../../generated/gamePacket.js';

const fleaMarketNotificationHandler = (socket: GameSocket, gamePacket: GamePacket) => {};

export default fleaMarketNotificationHandler;
