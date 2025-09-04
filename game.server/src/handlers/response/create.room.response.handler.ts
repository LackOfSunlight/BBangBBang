import { Socket } from "net";
import { S2CCreateRoomResponse } from "../../generated/packet/room_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";

const createRoomResponseHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  createRoomResponseHandler;
