import { GameSocket } from '../Type/game.socket';
import { GamePacket } from '../Generated/gamePacket';
import { getGamePacketType } from '../Converter/type.form';
import { GamePacketType, gamePackTypeSelect } from '../Enums/gamePacketType';
import positionUpdateUseCase from '../UseCase/Position.update/position.update.usecase';
import { C2SPositionUpdateRequest } from '../Generated/packet/game_actions';

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
