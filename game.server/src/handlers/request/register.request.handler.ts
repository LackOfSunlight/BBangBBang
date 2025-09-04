import { Socket } from "net";
import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from "../../utils/type.converter.js";
import { gamePackType } from "../../enums/gamePacketType.js";

const registerRequestHandler = (socket: Socket, gamePacket: GamePacket) => {
  const payload = getGamePacketType(gamePacket, gamePackType.registerRequest);

  if (payload) {
    // payload는 자동으로 { oneofKind: "cardSelectRequest"; cardSelectRequest: C2SCardSelectRequest } 타입
    console.log(payload.registerRequest.email);
    console.log(payload.registerRequest.nickname);
    console.log(payload.registerRequest.password);
  }
};
export default registerRequestHandler;
