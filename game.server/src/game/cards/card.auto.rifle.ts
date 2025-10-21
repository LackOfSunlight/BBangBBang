import { CardCategory } from '@game/enums/card.category';
import { CardType, CharacterStateType } from '@core/generated/common/enums';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import { ICard } from '@common/types/card';

export class AutoRifleCard implements ICard {
	type: CardType = CardType.AUTO_RIFLE;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.weapon === CardType.AUTO_RIFLE) return false;

		if (user.character.weapon) room.repeatDeck([user.character.weapon]);
		user.character.weapon = CardType.AUTO_RIFLE;
		user.character.removeHandCard(CardType.AUTO_RIFLE);

		return true;
	}
}
