import { CardCategory } from '@game/enums/card.category';
import { CardType, CharacterStateType } from '@core/generated/common/enums';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import { ICard } from '@common/types/card';

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
