import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { ICard } from '../../type/card';

export class DeathMatchCard implements ICard {
	type: CardType = CardType.DEATH_MATCH;
	cardCategory: CardCategory = CardCategory.targetCard;

	public useCard(room: Room, user: User, target: User): boolean {
		const nowTime = Date.now();

		const DEATH_MATCH_DURATION_MS = 10;

		// 유효성 검증
		if (!user.character || !target.character) return false;

		const isBbangCard: boolean = user.character.handCards.some((c) => c.type === CardType.BBANG);

		if (
			!isBbangCard ||
			(target.character.stateInfo &&
				target.character.stateInfo.state === CharacterStateType.CONTAINED)
		) {
			return false;
		}

		if (target.character.stateInfo.state !== CharacterStateType.NONE_CHARACTER_STATE) return false;

		room.removeCard(user, CardType.DEATH_MATCH);
		if (user.character && target.character) {
			user.character.changeState(
				CharacterStateType.DEATH_MATCH_TURN_STATE,
				CharacterStateType.NONE_CHARACTER_STATE,
				nowTime + DEATH_MATCH_DURATION_MS,
				target.id,
			);

			target.character.changeState(
				CharacterStateType.DEATH_MATCH_STATE,
				CharacterStateType.NONE_CHARACTER_STATE,
				nowTime + DEATH_MATCH_DURATION_MS,
				user.id,
			);
		}

		return true;
	}
}
