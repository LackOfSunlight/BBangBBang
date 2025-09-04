import { Socket } from "net";
import { C2SGameStartRequest } from "../../generated/packet/game_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";

const gameStartRequestHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  gameStartRequestHandler;
