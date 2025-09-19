import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../utils/type.converter';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import positionUpdateUseCase from '../useCase/position.update/position.update.usecase';
import { C2SPositionUpdateRequest } from '../generated/packet/game_actions';

const reactionUpdateHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.reactionRequest);
	if (!payload) return;

	const req = payload.reactionRequest;

};
export default reactionUpdateHandler;