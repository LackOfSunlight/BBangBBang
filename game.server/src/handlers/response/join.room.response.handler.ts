import { Socket } from "net";
import { S2CJoinRoomResponse } from "../../generated/packet/room_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";

const joinRoomResponseHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  joinRoomResponseHandler;
