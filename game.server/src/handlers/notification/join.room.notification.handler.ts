import { GameSocket } from '../../type/game.socket.js';
import { S2CJoinRoomNotification } from '../../generated/packet/notifications.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { connectedSockets } from '../../sockets/socket.manger.js';
import { getRoom } from '../../utils/redis.util.js';
import { Room } from '../../models/room.model.js';
import { sendData } from '../../utils/send.data.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { User } from '../../models/user.model.js';
import { broadcastDataToRoom } from '../../utils/notification.util.js';

const joinRoomNotificationHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const roomId = socket.roomId;

	if(!roomId) return;

    const room:Room|null = await getRoom(roomId);

    if(!room) return;

    broadcastDataToRoom(room.users,gamePacket,GamePacketType.joinRoomNotification);
    
};


export const setJoinRoomNotification = (joinUser: User):GamePacket => {
  const newGamePacket: GamePacket = {
    payload:{
      oneofKind: GamePacketType.joinRoomNotification,
      joinRoomNotification:{
        joinUser
      }
    }
  };

  return newGamePacket;
};

export default joinRoomNotificationHandler;
