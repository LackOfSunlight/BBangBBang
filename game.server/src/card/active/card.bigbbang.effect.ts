// cardType = 2
import {
	getRoom,
	getUserFromRoom,
} from '../../utils/room.utils';
import { CardType, CharacterStateType } from '../../generated/common/enums.js';
import { cardManager } from '../../managers/card.manager.js';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const cardBigBbangEffect = (room: Room , shooter: User , targetUser: User): boolean => {
	const nowTime = Date.now();

	if (!room || !shooter) {
		return false;
	}

	// "카드 사용을 막아야 하는 상태"만 정의
	const isBlockedStateUsers = room.users.some(
		(s) =>
			s.character &&
			s.character.stateInfo?.state !== CharacterStateType.NONE_CHARACTER_STATE// NONE이 아닌데
			// s.character.stateInfo?.state !== CharacterStateType.CONTAINED, // CONTAINED도 아닌 경우
	);

	if (isBlockedStateUsers) {
		return false;
	}

	cardManager.removeCard(shooter, room, CardType.BIG_BBANG);


	for (let user of room.users) {
		if (user.character?.stateInfo?.state != null) {
			if (user.id === shooter.id) {
				user.character.stateInfo.state = CharacterStateType.BIG_BBANG_SHOOTER;
				user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
				user.character.stateInfo.nextStateAt = `${nowTime + 10}`;
				user.character.stateInfo.stateTargetUserId = targetUser.id;

				continue;
			}

			if (user.character && user.character.hp > 0 && user.character.stateInfo.state != CharacterStateType.CONTAINED) {
				user.character.stateInfo.state = CharacterStateType.BIG_BBANG_TARGET;
				user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
				user.character.stateInfo.nextStateAt = `${nowTime + 10}`;
				user.character.stateInfo.stateTargetUserId = shooter.id;
			}
		}
	}

	// saveRoom(room);

	return true;
};

export default cardBigBbangEffect;
