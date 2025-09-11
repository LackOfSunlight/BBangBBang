import { GameSocket } from "../../type/game.socket.js";
import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { CardType, GlobalFailCode } from "../../generated/common/enums.js";
//import { sendData } from "../../utils/send.data.js";
import { broadcastDataToRoom } from "../../utils/notification.util.js";
import { Room } from "../../models/room.model";
import {getRoom } from "../../utils/redis.util.js";

const useCardNotificationHandler = async (socket:GameSocket, gamePacket:GamePacket) =>{
    const payload = getGamePacketType(gamePacket, gamePackTypeSelect.useCardNotification);
    if(!payload) return;
    const noti = payload.useCardNotification;
 
    if(!noti.targetUserId) 
        console.log(`${socket.userId}님이 ${CardType[noti.cardType]} 카드를 사용하였습니다.`);
    else 
        console.log(`${socket.userId}님이 ${noti.targetUserId}님에게 ${CardType[noti.cardType]} 카드를 사용하였습니다.`);
    
    if(!socket.roomId) return;
    const roomData:Room|null = await getRoom(socket.roomId);
    if(!roomData) return;
    broadcastDataToRoom(
            roomData.users,
            gamePacket,
            GamePacketType.useCardNotification,
            socket
    );
}


export default  useCardNotificationHandler;
