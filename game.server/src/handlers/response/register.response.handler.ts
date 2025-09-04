import { Socket } from "net";
import { S2CRegisterResponse } from "../../generated/packet/auth.js";
import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from "../../utils/type.converter.js";
import { GamePacketType, gamePackType } from "../../enums/gamePacketType.js";
import { GlobalFailCode } from "../../generated/common/enums.js";
import { sendData } from "../../utils/sendData.js";

const registerResponseHandler = (socket: Socket, gamePacket: GamePacket) => {
  const newGamePacket: GamePacket = {
    payload: {
      oneofKind: "registerResponse",
      registerResponse: {
        success: true,
        message: "성공",
        failCode: GlobalFailCode.NONE_FAILCODE,
      },
    },
  };

  sendData(socket, newGamePacket, GamePacketType.registerResponse);
};

export default registerResponseHandler;
