// cardType = 2
import { getRoom, removeUserFromRoom, saveRoom } from '../utils/redis.util.js';
import { CardType, CharacterStateType } from '../generated/common/enums.js';
import { repeatDeck } from '../managers/card.manager.js';

const cardBigBbangEffect = async (roomId: number, userId: string, targetUserId: string) => {
	const room = await getRoom(roomId);

	if (!room) {
		console.log('방이 존재하지 않습니다.');
		return;
	}

	for (let user of room.users) {
		if (user.character?.stateInfo?.state != null) {
			if (user.id === userId) {
				user.character.stateInfo.state = CharacterStateType.BIG_BBANG_SHOOTER;
				user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
				user.character.stateInfo.nextStateAt = `${Date.now() + 10000}`;
				user.character.stateInfo.stateTargetUserId = targetUserId;

				continue;
			}

			if (user.character && user.character.hp > 0) {
				user.character.stateInfo.state = CharacterStateType.BIG_BBANG_TARGET;
				user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
				user.character.stateInfo.nextStateAt = `${Date.now() + 10000}`;
				user.character.stateInfo.stateTargetUserId = userId;
			}
		}
	}

	await saveRoom(room);
};

export default cardBigBbangEffect;
