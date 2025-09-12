import { GameSocket } from '../../type/game.socket.js';
import { S2CCardEffectNotification } from '../../generated/packet/notifications.js';
import { GamePacket } from '../../generated/gamePacket.js';

const cardEffectNotificationHandler = (socket: GameSocket, gamePacket: GamePacket) => {};

export default cardEffectNotificationHandler;
