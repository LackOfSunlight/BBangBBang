// cardType = 6
import { getUserFromRoom, updateCharacterFromRoom, getRoom } from '../utils/room.utils';
import { CardType, CharacterStateType } from '../generated/common/enums';
import { removeCard } from '../managers/card.manager.js';

const cardDeathMatchEffect = (roomId: number, userId: string, targetUserId: string): boolean => {
	const user = getUserFromRoom(roomId, userId);
	const room = getRoom(roomId);

	// 유효성 검증
	if (!user || !user.character || !room) return false;

	const target = getUserFromRoom(roomId, targetUserId);

	// 유효성 검증
	if (!target || !target.character) return false;

	// 카드 제거
	removeCard(user, room, CardType.DEATH_MATCH);

	const isBbangCard: boolean = user.character.handCards.some((c) => c.type === CardType.BBANG);
	const isEnemyBbangCard: boolean = target.character.handCards.some((c) => c.type === CardType.BBANG);

	// 캐릭터중 어느쪽도 빵야 카드가 없다면 실행되지 않음
	if (!isBbangCard || !isEnemyBbangCard) {
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
