import { Socket } from "net";
import { C2SJoinRoomRequest } from "../../generated/packet/room_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";


const joinRoomRequestHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  joinRoomRequestHandler;
