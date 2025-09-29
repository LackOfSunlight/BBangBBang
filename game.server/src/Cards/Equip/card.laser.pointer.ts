import { CardCategory } from '../../Enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';
import { ICard } from '../../Type/card';

export class LaserPointerCard implements ICard {
	type: CardType = CardType.LASER_POINTER;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.equips.includes(CardType.LASER_POINTER)) return false;

		user.character.equips.push(CardType.LASER_POINTER);
		room.removeCard(user, CardType.LASER_POINTER);

		return true;
	}
}
