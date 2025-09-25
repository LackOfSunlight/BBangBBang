// cardType = 6
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const cardDeathMatchEffect = (room: Room, user: User, targetUser: User): boolean => {
	const nowTime = Date.now();

	// 유효성 검증
	if (!user || !user.character || !room) return false;
	if (!targetUser || !targetUser.character) return false;

	const isBbangCard: boolean = user.character.handCards.some((c) => c.type === CardType.BBANG);

	if (!isBbangCard || (targetUser.character.stateInfo && targetUser.character.stateInfo.state === CharacterStateType.CONTAINED)) {
		return false;
	}

	// 현피 카드 효과: 현피 상태 설정
	// 사용자: DEATH_MATCH_TURN_STATE (현피 차례)
	// 대상: DEATH_MATCH_STATE (현피 대기)

	if (user.character && targetUser.character) {
		user.character.stateInfo = {
			state: CharacterStateType.DEATH_MATCH_TURN_STATE,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: `${nowTime + 10}`,
			stateTargetUserId: targetUser.id,
		};

		targetUser.character.stateInfo = {
			state: CharacterStateType.DEATH_MATCH_STATE,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: `${nowTime + 10}`,
			stateTargetUserId: user.id,
		};
	}

	return true;
};

export default cardDeathMatchEffect;
