// cardType = 7
import { CardType, CharacterStateType } from '../../generated/common/enums.js';
import { cardManager } from '../../managers/card.manager.js';
import { Room } from '../../models/room.model.js';
import { User } from '../../models/user.model.js';
import {
	getRoom,
	getUserFromRoom,
	saveRoom,
} from '../../utils/room.utils.js';

const cardGuerrillaEffect = (room: Room, shooter: User, targetUser: User): boolean => {

	const nowTime = Date.now();

	if (!room || !shooter) return false;

	const isBlockedStateUsers = room.users.some(
		(s) =>
			s.character &&
			s.character.stateInfo?.state !== CharacterStateType.NONE_CHARACTER_STATE// NONE이 아닌데
	);

	if (isBlockedStateUsers) {
		return false;
	}

	cardManager.removeCard(shooter, room, CardType.GUERRILLA);

	for (let user of room.users) {
		if (user.character?.stateInfo?.state != null) {
			if (user.id === shooter.id) {
				user.character.stateInfo.state = CharacterStateType.GUERRILLA_SHOOTER;
				user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
				user.character.stateInfo.nextStateAt = `${nowTime + 10}`;
				user.character.stateInfo.stateTargetUserId = targetUser.id;

				continue;
			}

			if (user.character && user.character.hp > 0 && user.character.stateInfo.state != CharacterStateType.CONTAINED) {
				user.character.stateInfo.state = CharacterStateType.GUERRILLA_TARGET;
				user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
				user.character.stateInfo.nextStateAt = `${nowTime + 10}`;
				user.character.stateInfo.stateTargetUserId = shooter.id;
			}
		}
	}

	saveRoom(room);
	return true;
};

export default cardGuerrillaEffect;
