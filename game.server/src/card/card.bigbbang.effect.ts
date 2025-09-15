// cardType = 2
import {
	getRoom,
	getUserFromRoom,
	removeUserFromRoom,
	saveRoom,
	updateCharacterFromRoom,
} from '../utils/redis.util.js';
import { CardType, CharacterStateType } from '../generated/common/enums.js';
import { drawSpecificCard, repeatDeck } from '../managers/card.manager.js';

const cardBigBbangEffect = async (
	roomId: number,
	userId: string,
	targetUserId: string,
): Promise<boolean> => {
	const room = await getRoom(roomId);
	const shooter = await getUserFromRoom(roomId, userId);

	if (!room || !shooter) {
		return false;
	}

	// "카드 사용을 막아야 하는 상태"만 정의
	const isBlockedStateUsers = room.users.some(
		(s) =>
			s.character &&
			s.character.stateInfo?.state !== CharacterStateType.NONE_CHARACTER_STATE && // NONE이 아닌데
			s.character.stateInfo?.state !== CharacterStateType.CONTAINED, // CONTAINED도 아닌 경우
	);

	if (isBlockedStateUsers) {
		const getCard = drawSpecificCard(room.id, CardType.BIG_BBANG);

		if (getCard) {
			const existCard = shooter?.character?.handCards.find((card) => card.type === getCard);
			if (existCard) {
				existCard.count += 1;
			} else {
				shooter.character?.handCards.push({ type: getCard, count: 1 });
			}

			await updateCharacterFromRoom(room.id, shooter.id, shooter.character!);
			return true;
		}
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

	return true;
};

export default cardBigBbangEffect;
