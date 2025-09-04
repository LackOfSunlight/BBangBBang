import { GamePacket } from "../generated/gamePacket.js";
export declare function getGamePacketType<T extends GamePacket["payload"]["oneofKind"]>(gamePacket: GamePacket, type: T): Extract<GamePacket["payload"], {
    oneofKind: T;
}> | undefined;
//# sourceMappingURL=type.converter.d.ts.map