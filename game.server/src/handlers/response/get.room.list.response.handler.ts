import { Socket } from "net";
import { S2CGetRoomListResponse } from "../../generated/packet/room_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";

const getRoomListResponseHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  getRoomListResponseHandler;
