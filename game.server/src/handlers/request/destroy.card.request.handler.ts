import { Socket } from "net";
import { C2SDestroyCardRequest } from "../../generated/packet/game_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";

const destroyCardRequestHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  destroyCardRequestHandler;
