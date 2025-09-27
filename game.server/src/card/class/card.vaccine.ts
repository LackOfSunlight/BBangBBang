import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { IBuffCard } from '../../type/card';

export class VaccineCard implements IBuffCard {
	type: CardType = CardType.VACCINE;
	cardCategory: CardCategory = CardCategory.buffCard;

	public useCard(room: Room, user: User): boolean {
		room.removeCard(user, CardType.VACCINE);

		if (!user.character) return false;

		return user.character.addHealth(1);
	}
}
