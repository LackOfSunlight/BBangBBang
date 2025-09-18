import { C2SPositionUpdateRequest } from '../../generated/packet/game_actions';
import { GameSocket } from '../../type/game.socket';
import { CharacterPositionData } from '../../generated/common/types';
import { notificationCharacterPosition } from '../../managers/game.manager';

const positionUpdateUseCase = async (
	socket: GameSocket,
	req: C2SPositionUpdateRequest,
): Promise<boolean> => {
	const { userId, roomId } = socket;

	if (!userId || !roomId) {
		return false;
	}

	// 1. 좌표 데이터 검증
	if (typeof req.x !== 'number' || typeof req.y !== 'number') {
		return false;
	}

	// 2. CharacterPositionData 생성
	const positionData: CharacterPositionData = {
		id: userId,
		x: req.x,
		y: req.y,
	};

	// 3. 위치 정보 업데이트
	const roomMap = notificationCharacterPosition.get(roomId);
	roomMap!.set(userId, positionData);

	// 5. 성공
	return true;
};

export default positionUpdateUseCase;
