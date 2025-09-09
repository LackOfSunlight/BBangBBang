import { GameSocket } from "../../type/game.socket.js";
import { S2CUseCardNotification } from "../../generated/packet/notifications.js";
import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { CardType, GlobalFailCode } from "../../generated/common/enums.js";
//import { sendData } from "../../utils/send.data.js";
import { broadcastDataToRoom } from "../../utils/notification.util.js";
import { Room } from "../../models/room.model";

const useCardNotificationHandler = (socket:GameSocket, gamePacket:GamePacket, roomData: Room) =>{
    const payload = getGamePacketType(gamePacket, gamePackTypeSelect.useCardNotification);
    if(!payload) return;
    const noti = payload.useCardNotification;
 
    if(!noti.targetUserId) 
        console.log(`${socket.userId}님이 ${CardType[noti.cardType]} 카드를 사용하였습니다.`);
    else 
        console.log(`${socket.userId}님이 ${noti.targetUserId}님에게 ${CardType[noti.cardType]} 카드를 사용하였습니다.`);
    //sendData(socket, gamePacket, GamePacketType.useCardResponse);
    broadcastDataToRoom(
        roomData.users,
        gamePacket,
        GamePacketType.useCardNotification,
        socket
    );
}


export default  useCardNotificationHandler;
