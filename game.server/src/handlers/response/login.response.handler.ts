import { GameSocket } from "../../utils/game.socket.js";
import { GamePacket} from "../../generated/gamePacket.js";
import { sendData } from '../../utils/sendData';
import { GamePacketType, gamePackTypeSelect } from "../../enums/gamePacketType.js";
import { GlobalFailCode } from "../../generated/common/enums.js";

const loginResponseHandler = (socket:GameSocket, gamePacket:GamePacket) =>{
  

      sendData(socket, gamePacket, GamePacketType.loginResponse);
}

export default  loginResponseHandler;
