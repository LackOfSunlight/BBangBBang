// cardType = 6
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const DEATH_MATCH_DURATION_MS = 10;

const cardDeathMatchEffect = (room: Room, user: User, targetUser: User): boolean => {
	const nowTime = Date.now();

	// 유효성 검증
	if (!user.character || !targetUser.character) return false;

	const isBbangCard: boolean = user.character.handCards.some((c) => c.type === CardType.BBANG);

	if (
		!isBbangCard ||
		(targetUser.character.stateInfo &&
			targetUser.character.stateInfo.state === CharacterStateType.CONTAINED)
	) {
		return false;
	}

	room.removeCard(user, CardType.BIG_BBANG);
	if (user.character && targetUser.character) {
		user.character.stateInfo = {
			state: CharacterStateType.DEATH_MATCH_TURN_STATE,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: `${nowTime + DEATH_MATCH_DURATION_MS}`,
			stateTargetUserId: targetUser.id,
		};

		targetUser.character.stateInfo = {
			state: CharacterStateType.DEATH_MATCH_STATE,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: `${nowTime + DEATH_MATCH_DURATION_MS}`,
			stateTargetUserId: user.id,
		};
	}

	return true;
};

export default cardDeathMatchEffect;
