import { Socket } from "net";
import { S2CRegisterResponse } from "../../generated/packet/auth.js";
import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from "../../utils/type.converter.js";
import { GamePacketType, gamePackType } from "../../enums/gamePacketType.js";
import { GlobalFailCode } from "../../generated/common/enums.js";
import { sendData } from "../../utils/sendData.js";

const registerResponseHandler = (socket: Socket, gamePacket: GamePacket) => {

  const payload = getGamePacketType(gamePacket, gamePackType.registerResponse);

  if(payload){
    if(payload.registerResponse.failCode === GlobalFailCode.NONE_FAILCODE){
      payload.registerResponse.message = '회원가입을 완료하였습니다.'
    }
  }

  sendData(socket, gamePacket, GamePacketType.registerResponse);

};

export default registerResponseHandler;
