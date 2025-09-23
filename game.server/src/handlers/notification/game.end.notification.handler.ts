// import { GameSocket } from '../../type/game.socket';
// import { GamePacket } from '../../generated/gamePacket';
// import { GamePacketType } from '../../enums/gamePacketType';
// import { broadcastDataToRoom } from '../../utils/notification.util';
// import { getRoom } from '../../utils/room.utils';
// import { Room } from '../../models/room.model';

// const gameEndNotificationHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
// 	if (!socket.roomId) return;

// 	const room: Room | null = await getRoom(socket.roomId);
// 	if (!room) return;

// 	broadcastDataToRoom(room.users, gamePacket, GamePacketType.gameEndNotification);
// };


// export default gameEndNotificationHandler;
