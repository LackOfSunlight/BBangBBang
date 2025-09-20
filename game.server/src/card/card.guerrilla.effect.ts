import { CardType, CharacterStateType } from "../generated/common/enums";
import { drawSpecificCard } from "../managers/card.manager";
import { getRoom, getUserFromRoom, saveRoom, updateCharacterFromRoom } from "../utils/room.utils";


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
		const getCard = drawSpecificCard(room.id, CardType.GUERRILLA);

		if (getCard) {
			const existCard = shooter?.character?.handCards.find((card) => card.type === getCard);
			if (existCard) {
				existCard.count += 1;
			} else {
				shooter.character?.handCards.push({ type: getCard, count: 1 });
			}

			updateCharacterFromRoom(room.id, shooter.id, shooter.character!);
			return true;
		}
	}

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
