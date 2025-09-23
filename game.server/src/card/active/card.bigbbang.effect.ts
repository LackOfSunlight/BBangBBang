// cardType = 2
import {
	getRoom,
	getUserFromRoom,
} from '../../utils/room.utils';
import { CardType, CharacterStateType } from '../../generated/common/enums.js';
import { removeCard } from '../../managers/card.manager.js';

const cardBigBbangEffect = (roomId: number, userId: string, targetUserId: string): boolean => {
	const room = getRoom(roomId);
	const shooter = getUserFromRoom(roomId, userId);
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

	removeCard(shooter, room, CardType.BIG_BBANG);


	for (let user of room.users) {
		if (user.character?.stateInfo?.state != null) {
			if (user.id === userId) {
				user.character.stateInfo.state = CharacterStateType.BIG_BBANG_SHOOTER;
				user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
				user.character.stateInfo.nextStateAt = `${nowTime + 10}`;
				user.character.stateInfo.stateTargetUserId = targetUserId;

				continue;
			}

			if (user.character && user.character.hp > 0 && user.character.stateInfo.state != CharacterStateType.CONTAINED) {
				user.character.stateInfo.state = CharacterStateType.BIG_BBANG_TARGET;
				user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
				user.character.stateInfo.nextStateAt = `${nowTime + 10}`;
				user.character.stateInfo.stateTargetUserId = userId;
			}
		}
	}

	// saveRoom(room);

	return true;
};

export default cardBigBbangEffect;
