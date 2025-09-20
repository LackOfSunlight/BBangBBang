// cardType = 7
import { CardType, CharacterStateType } from '../generated/common/enums.js';
import { drawSpecificCard, removeCard, repeatDeck } from '../managers/card.manager.js';
import {
	getRoom,
	getUserFromRoom,
	saveRoom,
	updateCharacterFromRoom,
} from '../utils/room.utils.js';

const cardGuerrillaEffect = (roomId: number, userId: string, targetUserId: string): boolean => {
	const room = getRoom(roomId);
	const shooter = getUserFromRoom(roomId, userId);

	if (!room || !shooter) return false;

	const isBlockedStateUsers = room.users.some(
		(s) =>
			s.character &&
			s.character.stateInfo?.state !== CharacterStateType.NONE_CHARACTER_STATE && // NONE이 아닌데
			s.character.stateInfo?.state !== CharacterStateType.CONTAINED, // CONTAINED도 아닌 경우
	);

	if (isBlockedStateUsers) {
		return false;
	}

	removeCard(shooter, room, CardType.GUERRILLA);

	for (let user of room.users) {
		if (user.character?.stateInfo?.state != null) {
			if (user.id === userId) {
				user.character.stateInfo.state = CharacterStateType.GUERRILLA_SHOOTER;
				user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
				user.character.stateInfo.nextStateAt = `${Date.now() + 10000}`;
				user.character.stateInfo.stateTargetUserId = targetUserId;

				continue;
			}

			if (user.character && user.character.hp > 0) {
				user.character.stateInfo.state = CharacterStateType.GUERRILLA_TARGET;
				user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
				user.character.stateInfo.nextStateAt = `${Date.now() + 10000}`;
				user.character.stateInfo.stateTargetUserId = userId;
			}
		}
	}

	saveRoom(room);
	return true;
};

export default cardGuerrillaEffect;
