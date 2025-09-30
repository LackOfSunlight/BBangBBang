import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { ICard } from '../../type/card';

export class VaccineCard implements ICard {
	type: CardType = CardType.VACCINE;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, user: User): boolean {
		if (!user.character) return false;

		if (user.character.hp >= user.character.maxHp) return false;

		room.removeCard(user, CardType.VACCINE);
		user.character.addHealth(1);
		return true;
	}
}
