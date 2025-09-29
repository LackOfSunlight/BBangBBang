import { CardCategory } from '../../Enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';
import { ICard } from '../../Type/card';

export class AutoRifleCard implements ICard {
	type: CardType = CardType.AUTO_RIFLE;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		if (user.character.weapon === CardType.AUTO_RIFLE) return false;

		user.character.weapon = CardType.AUTO_RIFLE;
		room.removeCard(user, CardType.AUTO_RIFLE);

		return true;
	}
}
