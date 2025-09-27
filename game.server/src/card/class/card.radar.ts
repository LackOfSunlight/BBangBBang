import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { IEquipCard as IEquipCard } from '../../type/card';

export class RadarCard implements IEquipCard {
	type: CardType = CardType.LASER_POINTER;
	cardCategory: CardCategory = CardCategory.equipCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.equips.includes(CardType.RADAR)) return false;

		user.character.equips.push(CardType.RADAR);
		room.removeCard(user, CardType.RADAR);

		return true;
	}
}
