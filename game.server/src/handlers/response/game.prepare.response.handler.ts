import { Socket } from "net";
import { S2CGamePrepareResponse } from "../../generated/packet/game_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";

const gamePrepareResponseHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  gamePrepareResponseHandler;
