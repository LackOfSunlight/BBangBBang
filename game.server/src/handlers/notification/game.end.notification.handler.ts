import { Socket } from "net";
import { S2CGameEndNotification } from "../../generated/packet/notifications.js";
import { GamePacket } from "../../generated/gamePacket.js";

const gameEndNotificationHandler = (socket:Socket,gamePacket:GamePacket) =>{

}


export default  gameEndNotificationHandler;
