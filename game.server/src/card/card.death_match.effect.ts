// cardType = 6
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/room.utils';
import { CardType, CharacterStateType } from '../generated/common/enums';

const cardDeathMatchEffect = (roomId: number, userId: string, targetUserId: string): boolean => {
	const user = getUserFromRoom(roomId, userId);

	// 유효성 검증
	if (!user || !user.character) return false;

	const target = getUserFromRoom(roomId, targetUserId);

	// 유효성 검증
	if (!target || !target.character) return false;

	const isBbangCard: boolean = user.character.handCards.some((c) => c.type === CardType.BBANG);

	if (!isBbangCard) {
		return false;
	}

	// 현피 카드 효과: 현피 상태 설정
	// 사용자: DEATH_MATCH_TURN_STATE (현피 차례)
	// 대상: DEATH_MATCH_STATE (현피 대기)

	user.character.stateInfo = {
		state: CharacterStateType.DEATH_MATCH_TURN_STATE,
		nextState: CharacterStateType.NONE_CHARACTER_STATE,
		nextStateAt: '0',
		stateTargetUserId: targetUserId,
	};

	target.character.stateInfo = {
		state: CharacterStateType.DEATH_MATCH_STATE,
		nextState: CharacterStateType.NONE_CHARACTER_STATE,
		nextStateAt: '0',
		stateTargetUserId: userId,
	};

	// 방에 업데이트된 캐릭터 정보 저장
	try {
		updateCharacterFromRoom(roomId, userId, user.character);
		updateCharacterFromRoom(roomId, targetUserId, target.character);
		return true;
	} catch (error) {
		return false;
	}
};

export default cardDeathMatchEffect;
