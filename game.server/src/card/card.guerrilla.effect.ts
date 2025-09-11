// cardType = 7
import { CardType, CharacterStateType } from '../generated/common/enums.js';
import { repeatDeck } from '../managers/card.manager.js';
import {
	getRoom,
	getUserFromRoom,
	saveRoom,
	updateCharacterFromRoom,
} from '../utils/redis.util.js';

const cardGuerrillaEffect = async (roomId: number, userId: string, targetUserId: string) => {
	const room = await getRoom(roomId);

	if (!room) return;

	for (let user of room.users) {
		if (user.character?.stateInfo?.state != null) {
			if (user.id === userId) {
				user.character.stateInfo.state = CharacterStateType.GUERRILLA_SHOOTER;
                user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
                user.character.stateInfo.nextStateAt = `${Date.now() + 10000}`;
                user.character.stateInfo.stateTargetUserId = targetUserId;
			} else {
				user.character.stateInfo.state = CharacterStateType.GUERRILLA_TARGET;
                user.character.stateInfo.nextState =CharacterStateType.NONE_CHARACTER_STATE;
                user.character.stateInfo.nextStateAt = `${Date.now() + 10000}`;
                user.character.stateInfo.stateTargetUserId = userId;
			}
		}
	}

	await saveRoom(room);
};

export default cardGuerrillaEffect;
