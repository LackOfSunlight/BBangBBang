import { C2SPositionUpdateRequest } from '../../generated/packet/game_actions';
import { GameSocket } from '../../type/game.socket';
import { CharacterPositionData } from '../../generated/common/types';
import { notificationCharacterPosition, roomPositionChanged } from '../../managers/game.manager';

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
	
	// 이전 위치와 비교하여 변화 감지
	const currentPosition = roomMap.get(userId);
	const isPositionChanged = !currentPosition || 
		currentPosition.x !== req.x || 
		currentPosition.y !== req.y;
	
	// 위치 업데이트
	roomMap.set(userId, positionData);
	
	// 위치가 변경되었으면 변화 플래그 설정
	if (isPositionChanged) {
		roomPositionChanged.set(roomId, true);
	}

	// 성공
	return true;
};

export default positionUpdateUseCase;
