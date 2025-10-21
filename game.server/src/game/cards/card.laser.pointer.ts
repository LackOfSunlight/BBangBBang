import { CardCategory } from '@game/enums/card.category';
import { CardType, CharacterStateType } from '@core/generated/common/enums';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import { ICard } from '@common/types/card';

export class LaserPointerCard implements ICard {
	type: CardType = CardType.LASER_POINTER;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.equips.includes(CardType.LASER_POINTER)) return false;

		user.character.equips.push(CardType.LASER_POINTER);
		user.character.removeHandCard(CardType.LASER_POINTER);

		return true;
	}
}
