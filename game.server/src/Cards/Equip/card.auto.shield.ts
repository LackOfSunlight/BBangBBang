import { CardCategory } from '../../Enums/card.category';
import { CardType, CharacterStateType } from '../../Generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';
import { ICard } from '../../Type/card';

export class AutoShieldCard implements ICard {
	type: CardType = CardType.AUTO_SHIELD;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.equips.includes(CardType.AUTO_SHIELD)) return false;

		user.character.equips.push(CardType.AUTO_SHIELD);
		room.removeCard(user, CardType.AUTO_SHIELD);

		return true;
	}
}
