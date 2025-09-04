import { Socket } from "net";
import { S2CUserUpdateNotification } from "../../generated/packet/notifications.js";
import { GamePacket } from "../../generated/gamePacket.js";

const userUpdateNotificationHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  userUpdateNotificationHandler;
