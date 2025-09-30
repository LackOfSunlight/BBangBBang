import { CardCategory } from '../../enums/card.category';
import { CardType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { ICard } from '../../type/card';

export class AutoShieldCard implements ICard {
	type: CardType = CardType.AUTO_SHIELD;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.equips.includes(CardType.AUTO_SHIELD)) return false;

		user.character.equips.push(CardType.AUTO_SHIELD);
		user.character.removeHandCard(CardType.AUTO_SHIELD);

		return true;
	}
}
