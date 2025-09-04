import { Socket } from "net";
import { S2CPositionUpdateNotification } from "../../generated/packet/notifications.js";
import { GamePacket } from "../../generated/gamePacket.js";

const positionUpdateNotificationHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  positionUpdateNotificationHandler;
