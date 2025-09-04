import { Socket } from "net";
import { S2CDestroyCardResponse } from "../../generated/packet/game_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";

const destroyCardResponseHandler = (socket:Socket, gamePacket:GamePacket) =>{

}


export default  destroyCardResponseHandler;
