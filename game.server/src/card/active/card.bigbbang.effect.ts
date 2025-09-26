// cardType = 2
import { CardType, CharacterStateType } from '../../generated/common/enums.js';
import { cardManager } from '../../managers/card.manager.js';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { stateChangeService } from '../../services/state.change.service';

const cardBigBbangEffect = (room: Room, shooter: User, targetUser: User): boolean => {

	if (!room || !shooter || !targetUser) {
		return false;
	}

	// "카드 사용을 막아야 하는 상태"만 정의
	const isBlockedStateUsers = room.users.some(
		(s) => s.character && s.character.stateInfo?.state !== CharacterStateType.NONE_CHARACTER_STATE
	);

	if (isBlockedStateUsers) {
		return false;
	}

	cardManager.removeCard(shooter, room, CardType.BIG_BBANG);

	for (let user of room.users) {
		// 타입 가드
		if (!user.character || !user.character.stateInfo) continue;

		if (user.id === shooter.id) {
			stateChangeService(
				user,
				CharacterStateType.BIG_BBANG_SHOOTER,
				CharacterStateType.NONE_CHARACTER_STATE,
				5,
			);
			continue;
		}

		if (
			user.character.hp > 0 &&
			user.character.stateInfo.state != CharacterStateType.CONTAINED
		) {
			stateChangeService(
				user,
				CharacterStateType.BIG_BBANG_TARGET,
				CharacterStateType.NONE_CHARACTER_STATE,
				5,
				shooter.id
			);
		}
	}

	return true;
};

export default cardBigBbangEffect;
