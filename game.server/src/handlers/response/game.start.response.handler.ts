import { Socket } from "net";
import { S2CGameStartResponse } from "../../generated/packet/game_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";

const gameStartResponseHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  gameStartResponseHandler;
