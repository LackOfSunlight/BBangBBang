import { Socket } from "net";
import { S2CGameStartNotification } from "../../generated/packet/notifications.js";
import { GamePacket } from "../../generated/gamePacket.js";

const gameStartNotificationHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  gameStartNotificationHandler;
