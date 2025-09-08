import { GameSocket } from "../../type/game.socket.js";
import { S2CUseCardNotification } from "../../generated/packet/notifications.js";
import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { CardType, GlobalFailCode } from "../../generated/common/enums.js";
import { sendData } from "../../utils/send.data.js";

const useCardNotificationHandler = (socket:GameSocket, gamePacket:GamePacket) =>{
    const payload = getGamePacketType(gamePacket, gamePackTypeSelect.useCardNotification);
    if(!payload) return;
    const noti = payload.useCardNotification;
 
    if(noti.targetUserId) 
        console.log(`${socket.userId}님이 ${noti.targetUserId}님에게 ${CardType[noti.cardType]} 카드를 사용하였습니다.`);
    else 
        console.log(`카드 사용에 실패하였습니다.[}]`);
    sendData(socket, gamePacket, GamePacketType.useCardResponse);
}


export default  useCardNotificationHandler;
