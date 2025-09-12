import { GameSocket } from '../../type/game.socket.js';
//import { S2CEquipCardNotification } from "../../generated/packet/notifications.js";
import { GamePacket } from '../../generated/gamePacket.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { broadcastDataToRoom } from '../../utils/notification.util.js';
import { Room } from '../../models/room.model';
import { getRoom } from '../../utils/redis.util.js';

const equipCardNotificationHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	if (!socket.roomId) return;
	const roomData: Room | null = await getRoom(socket.roomId);
	if (!roomData) return;
	broadcastDataToRoom(roomData.users, gamePacket, GamePacketType.useCardNotification, socket);
};

export default equipCardNotificationHandler;
