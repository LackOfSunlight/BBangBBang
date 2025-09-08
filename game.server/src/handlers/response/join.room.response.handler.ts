import { GameSocket } from "../../type/game.socket.js";
import { S2CJoinRoomResponse } from "../../generated/packet/room_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";
import { sendData } from "../../utils/send.data.js";
import { GamePacketType, gamePackTypeSelect } from "../../enums/gamePacketType.js";

const joinRoomResponseHandler = (socket:GameSocket, gamePacket:GamePacket) =>{

    sendData(socket, gamePacket, GamePacketType.joinRoomResponse);
}


export default  joinRoomResponseHandler;
