import { CardCategory } from '@game/enums/card.category';
import { CardType, CharacterStateType } from '@core/generated/common/enums';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import { ICard } from '@common/types/card';

export class SniperGunCard implements ICard {
	type: CardType = CardType.SNIPER_GUN;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.weapon === CardType.SNIPER_GUN) return false;

		if (user.character.weapon) room.repeatDeck([user.character.weapon]);

		user.character.weapon = CardType.SNIPER_GUN;
		user.character.removeHandCard(CardType.SNIPER_GUN);

		return true;
	}
}
