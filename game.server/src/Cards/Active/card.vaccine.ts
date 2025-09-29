import { CardCategory } from '../../Enums/card.category';
import { CardType, CharacterStateType } from '../../Generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';
import { ICard } from '../../Type/card';

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
