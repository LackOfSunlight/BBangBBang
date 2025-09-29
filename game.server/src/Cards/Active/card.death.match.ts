import { CardCategory } from '../../Enums/card.category';
import { CardType, CharacterStateType } from '../../Generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';
import { ICard } from '../../Type/card';

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

		room.removeCard(user, CardType.BIG_BBANG);
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
