import { Socket } from "net";
import { C2SLeaveRoomRequest } from "../../generated/packet/room_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";


const leaveRoomRequestHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  leaveRoomRequestHandler;
