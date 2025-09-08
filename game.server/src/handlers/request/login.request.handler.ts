import { GameSocket } from "../../type/game.socket.js";
import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from "../../utils/type.converter.js";
import { GamePacketType, gamePackTypeSelect } from "../../enums/gamePacketType.js";
import loginResponseHandler from "../response/login.response.handler.js";
import { GlobalFailCode } from "../../generated/common/enums.js";
import { UserData } from "../../generated/common/types.js";



const loginRequestHandler = (socket: GameSocket, gamePacket: GamePacket) => {
  const payload = getGamePacketType(gamePacket, gamePackTypeSelect.loginRequest);

  if (payload) {
    console.log(`로그인 이메일:${payload.loginRequest.email}`);

    const userId = payload.loginRequest.email;

    socket.userId = userId;
    
    loginResponseHandler(socket, gamePacket);
  }
};

const setLoginResponse = (
  success: boolean,
  message: string,
  token: string,
  myInfo: UserData,
  failCode: GlobalFailCode
): GamePacket => {
  const newGamePacket: GamePacket = {
    payload: {
      oneofKind: GamePacketType.loginResponse,
      loginResponse: {
        success: success,
        message: message,
        token: token,
        myInfo: myInfo,
        failCode: failCode,
      },
    },
  };

  return newGamePacket;
};

export default loginRequestHandler;
