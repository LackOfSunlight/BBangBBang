export function getGamePacketType(gamePacket, type) {
    if (gamePacket.payload.oneofKind === type) {
        return gamePacket.payload;
    }
    return undefined;
}
