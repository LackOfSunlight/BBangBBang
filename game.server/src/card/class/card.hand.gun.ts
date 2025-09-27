import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { IEquipCard } from '../../type/card';

export class HandGunCard implements IEquipCard {
	type: CardType = CardType.HAND_GUN;
	cardCategory: CardCategory = CardCategory.equipCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.weapon === CardType.HAND_GUN) return false;

		user.character.weapon = CardType.HAND_GUN;
		room.removeCard(user, CardType.HAND_GUN);

		return true;
	}
}
