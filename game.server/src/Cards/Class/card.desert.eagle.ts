import { CardCategory } from '../../Enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';
import { ICard } from '../../Type/card';

export class DesertEagleCard implements ICard {
	type: CardType = CardType.SNIPER_GUN;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.weapon === CardType.DESERT_EAGLE) return false;

		user.character.weapon = CardType.DESERT_EAGLE;
		room.removeCard(user, CardType.DESERT_EAGLE);

		return true;
	}
}
