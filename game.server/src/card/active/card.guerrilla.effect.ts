// cardType = 7
import { CardType, CharacterStateType } from '../../generated/common/enums.js';
import { Room } from '../../models/room.model.js';
import { User } from '../../models/user.model.js';
import { stateChangeService } from '../../services/state.change.service.js';

const cardGuerrillaEffect = (room: Room, shooter: User, targetUser: User): boolean => {
	const isBlockedStateUsers = room.users.some(
		(s) => s.character && s.character.stateInfo?.state !== CharacterStateType.NONE_CHARACTER_STATE,
	);

	if (isBlockedStateUsers) {
		return false;
	}

	room.removeCard(shooter, CardType.GUERRILLA);

	for (let user of room.users) {
		if (!user.character || !user.character.stateInfo) continue;

		if (user.id === shooter.id) {
			stateChangeService(
				user,
				CharacterStateType.GUERRILLA_SHOOTER,
				CharacterStateType.NONE_CHARACTER_STATE,
				5,
			);

			continue;
		}

		if (user.character.hp > 0 && user.character.stateInfo.state != CharacterStateType.CONTAINED) {
			stateChangeService(
				user,
				CharacterStateType.GUERRILLA_TARGET,
				CharacterStateType.NONE_CHARACTER_STATE,
				5,
				shooter.id,
			);
		}
	}

	return true;
};

export default cardGuerrillaEffect;
