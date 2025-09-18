// import { GameSocket } from '../../type/game.socket.js';
// import { S2CGamePrepareNotification } from '../../generated/packet/notifications.js';
// import { GamePacket } from '../../generated/gamePacket.js';
// import { GamePacketType } from '../../enums/gamePacketType.js';
// import { Room } from '../../models/room.model.js';
// import { sendData } from '../../utils/send.data.js';
// import { getRoom } from '../../utils/redis.util.js';
// import { broadcastDataToRoom } from '../../utils/notification.util.js';

// const gamePrepareNotificationHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
// 	const roomId = socket.roomId;

// 	if (!roomId) return;

// 	const room: Room | null = await getRoom(roomId);

// 	if (!room) return;

// 	broadcastDataToRoom(room.users, gamePacket, GamePacketType.gamePrepareNotification);
// };

// export const setGamePrepareNotification = (room: Room): GamePacket => {
// 	const newGamePacket: GamePacket = {
// 		payload: {
// 			oneofKind: GamePacketType.gamePrepareNotification,
// 			gamePrepareNotification: {
// 				room,
// 			},
// 		},
// 	};

// 	return newGamePacket;
// };

// export default gamePrepareNotificationHandler;
