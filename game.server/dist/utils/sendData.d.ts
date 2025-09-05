import { GamePacket } from "../generated/gamePacket.js";
import { GamePacketType } from "../enums/gamePacketType.js";
import { Socket } from "net";
export declare const sendData: (socket: Socket, gamePacket: GamePacket, gamePacketType: GamePacketType) => void;
//# sourceMappingURL=sendData.d.ts.map