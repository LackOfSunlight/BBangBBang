import { GamePacket } from '@core/generated/gamePacket';

export function getGamePacketType<T extends GamePacket['payload']['oneofKind']>(
	gamePacket: GamePacket,
	type: T,
): Extract<GamePacket['payload'], { oneofKind: T }> | undefined {
	if (gamePacket.payload.oneofKind === type) {
		return gamePacket.payload as Extract<GamePacket['payload'], { oneofKind: T }>;
	}
}
