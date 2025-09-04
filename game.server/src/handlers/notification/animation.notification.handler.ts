import { Socket } from "net";
import { S2CAnimationNotification } from "../../generated/packet/notifications.js";
import { GamePacket } from "../../generated/gamePacket.js";
import { GamePacketType } from "../../enums/gamePacketType";

const animationNotificationHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  animationNotificationHandler;
