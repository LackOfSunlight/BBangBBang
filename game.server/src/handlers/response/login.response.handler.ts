import { Socket } from "net";
import { GamePacket} from "../../generated/gamePacket.js";
import { sendData } from '../../utils/sendData';
import { GamePacketType, gamePackType } from "../../enums/gamePacketType.js";
import { GlobalFailCode } from "../../generated/common/enums.js";

const loginResponseHandler = (socket:Socket, gamePacket:GamePacket) =>{
  
      const newGamePacket: GamePacket = {
        payload: {
          oneofKind: GamePacketType.loginResponse,
          loginResponse: {
            success: true,
            message: `로그인 성공`,
            token: `토큰`,
            myInfo: undefined,
            failCode: GlobalFailCode.NONE_FAILCODE
          },
        },
      };

      sendData(socket, newGamePacket, GamePacketType.loginResponse);
}

export default  loginResponseHandler;
