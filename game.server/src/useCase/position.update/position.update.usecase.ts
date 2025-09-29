import { C2SPositionUpdateRequest } from '../../Generated/packet/game_actions';
import { GameSocket } from '../../Type/game.socket';
import { CharacterPositionData } from '../../Generated/common/types';
import { notificationCharacterPosition, roomPositionChanged } from '../../Managers/game.manager';

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
	if (!roomMap) {
		return false;
	}

	// 🎯 간단한 최적화: 위치가 변경된 경우만 Map에 추가
	const currentPosition = roomMap.get(userId);
	const isPositionChanged =
		!currentPosition || currentPosition.x !== req.x || currentPosition.y !== req.y;

	// 위치가 변경되었을 때만 Map에 추가하고 플래그 설정
	if (isPositionChanged) {
		roomMap.set(userId, positionData);
		roomPositionChanged.set(roomId, true);
	}

	// 성공
	return true;
};

export default positionUpdateUseCase;
