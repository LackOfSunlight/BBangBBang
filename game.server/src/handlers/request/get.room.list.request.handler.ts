import { Socket } from "net";
import { C2SGetRoomListRequest } from "../../generated/packet/room_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";

const getRoomListRequestHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  getRoomListRequestHandler;
