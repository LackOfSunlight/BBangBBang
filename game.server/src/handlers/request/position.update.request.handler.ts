import { GameSocket } from "../../utils/game.socket.js";
import { C2SPositionUpdateRequest } from "../../generated/packet/game_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";


const positionUpdateRequestHandler = (socket:GameSocket, gamePacket:GamePacket) => {

}
export default  positionUpdateRequestHandler;
