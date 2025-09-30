import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { ICard } from '../../type/card';

export class RadarCard implements ICard {
	type: CardType = CardType.LASER_POINTER;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.equips.includes(CardType.RADAR)) return false;

		user.character.equips.push(CardType.RADAR);
		user.character.removeHandCard(CardType.RADAR);

		return true;
	}
}
