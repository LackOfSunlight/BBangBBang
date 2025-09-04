import { Socket } from "net";
import { S2CJoinRandomRoomResponse } from "../../generated/packet/room_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";

const joinRandomRoomResponseHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  joinRandomRoomResponseHandler;
