import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { IEquipCard as IEquipCard } from '../../type/card';

export class LaserPointerCard implements IEquipCard {
	type: CardType = CardType.LASER_POINTER;
	cardCategory: CardCategory = CardCategory.equipCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.equips.includes(CardType.LASER_POINTER)) return false;

		user.character.equips.push(CardType.LASER_POINTER);
		room.removeCard(user, CardType.LASER_POINTER);

		return true;
	}
}
