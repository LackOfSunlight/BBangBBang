import { GameSocket } from "../../utils/game.socket.js";
import { S2CDestroyCardResponse } from "../../generated/packet/game_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";

const destroyCardResponseHandler = (socket:GameSocket, gamePacket:GamePacket) =>{

}


export default  destroyCardResponseHandler;
