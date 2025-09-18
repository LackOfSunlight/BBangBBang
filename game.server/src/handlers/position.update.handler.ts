import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../utils/type.converter';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import positionUpdateUseCase from '../useCase/position.update/position.update.usecase';
import { C2SPositionUpdateRequest } from '../generated/packet/game_actions';

const positionUpdateHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.positionUpdateRequest);
	if (!payload) return;

	const req = payload.positionUpdateRequest as C2SPositionUpdateRequest;

	// UseCase 호출
	const success = await positionUpdateUseCase(socket, req);

	if (!success) {
		console.warn(`[PositionUpdate] ${socket.userId}의 position 업데이트 실패`);
	}
};
export default positionUpdateHandler;
