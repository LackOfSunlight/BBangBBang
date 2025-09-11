import { GameSocket } from '../../type/game.socket.js';
import { S2CWarningNotification } from '../../generated/packet/notifications.js';
import { GamePacket } from '../../generated/gamePacket.js';

const warningNotificationHandler = (socket: GameSocket, gamePacket: GamePacket) => {};

export default warningNotificationHandler;
