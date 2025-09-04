import { Socket } from "net";
import { S2CLeaveRoomResponse } from "../../generated/packet/room_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";

const leaveRoomResponseHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  leaveRoomResponseHandler;
