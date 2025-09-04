import { Socket } from "net";
import { C2SPositionUpdateRequest } from "../../generated/packet/game_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";


const positionUpdateRequestHandler = (socket:Socket, gamePacket:GamePacket) => {

}
export default  positionUpdateRequestHandler;
