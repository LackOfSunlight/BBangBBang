import { GameSocket } from "../../type/game.socket.js";
import { S2CUserUpdateNotification } from "../../generated/packet/notifications.js";
import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
//import { CardType, GlobalFailCode } from "../../generated/common/enums.js";
import { broadcastDataToRoom } from "../../utils/notification.util.js";
import { Room } from "../../models/room.model";

const userUpdateNotificationHandler = (socket:GameSocket, gamePacket:GamePacket) =>{
    const payload = getGamePacketType(gamePacket, gamePackTypeSelect.userUpdateNotification);
    if(!payload) return;
    const noti = payload.userUpdateNotification;

    // broadcastDataToRoom(
    //         roomData.users,
    //         gamePacket,
    //         GamePacketType.userUpdateNotification,
    //         socket
    // );
}


export default  userUpdateNotificationHandler;
