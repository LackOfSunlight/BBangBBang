import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { IEquipCard } from '../../type/card';

export class SniperGunCard implements IEquipCard {
	type: CardType = CardType.SNIPER_GUN;
	cardCategory: CardCategory = CardCategory.equipCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.weapon === CardType.SNIPER_GUN) return false;

		user.character.weapon = CardType.SNIPER_GUN;
		room.removeCard(user, CardType.SNIPER_GUN);

		return true;
	}
}
