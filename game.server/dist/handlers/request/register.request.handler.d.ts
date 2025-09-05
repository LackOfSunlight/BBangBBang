import { Socket } from "net";
import { GamePacket } from "../../generated/gamePacket.js";
declare const registerRequestHandler: (socket: Socket, gamePacket: GamePacket) => Promise<void>;
export default registerRequestHandler;
//# sourceMappingURL=register.request.handler.d.ts.map