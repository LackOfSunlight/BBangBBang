import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { IEquipCard as IEquipCard } from '../../type/card';

export class AutoShieldCard implements IEquipCard {
	type: CardType = CardType.AUTO_SHIELD;
	cardCategory: CardCategory = CardCategory.equipCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.equips.includes(CardType.AUTO_SHIELD)) return false;

		user.character.equips.push(CardType.AUTO_SHIELD);
		room.removeCard(user, CardType.AUTO_SHIELD);

		return true;
	}
}
