import { GameSocket } from '../../type/game.socket.js';
import { S2CJoinRoomNotification } from '../../generated/packet/notifications.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { connectedSockets } from '../../sockets/socket.manger.js';
import { getRoom } from '../../utils/redis.util.js';
import { Room } from '../../models/room.model.js';
import { sendData } from '../../utils/send.data.js';
import { GamePacketType } from '../../enums/gamePacketType.js';

const joinRoomNotificationHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const roomId = socket.roomId;

	if(!roomId) return;

    const room:Room|null = await getRoom(roomId);

    if(!room) return;

    for(const roomUser of room.users){
        const targetSocket = connectedSockets.get(roomUser.id);
        if(targetSocket){
            sendData(targetSocket,gamePacket, GamePacketType.joinRoomNotification);
        }
    }
    
};

export default joinRoomNotificationHandler;
