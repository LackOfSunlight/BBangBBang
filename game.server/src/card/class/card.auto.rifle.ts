import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { IEquipCard } from '../../type/card';

export class AutoRifleCard implements IEquipCard {
	type: CardType = CardType.AUTO_RIFLE;
	cardCategory: CardCategory = CardCategory.equipCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.weapon === CardType.AUTO_RIFLE) return false;

		user.character.weapon = CardType.AUTO_RIFLE;
		room.removeCard(user, CardType.AUTO_RIFLE);

		return true;
	}
}
