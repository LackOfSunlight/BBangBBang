import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { ICard } from '../../type/card';

export class DesertEagleCard implements ICard {
	type: CardType = CardType.SNIPER_GUN;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.weapon === CardType.DESERT_EAGLE) return false;

		if (user.character.weapon) room.repeatDeck([user.character.weapon]);

		user.character.weapon = CardType.DESERT_EAGLE;
		user.character.removeHandCard(CardType.DESERT_EAGLE);

		return true;
	}
}
