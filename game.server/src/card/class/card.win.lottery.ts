import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { ICard } from '../../type/card';

export class WinLotteryCard implements ICard {
	type: CardType = CardType.BIG_BBANG;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		const LOTTERY_CARD_COUNT = 3;

		const newCardTypes = room.drawDeck(LOTTERY_CARD_COUNT);

		if (newCardTypes.length === 0) {
			return false;
		}

		if (user.character) {
			const character = user.character;
			newCardTypes.forEach((cardType) => {
				const existingCard = character.handCards.find((card) => card.type === cardType);
				if (existingCard) {
					existingCard.count += 1;
				} else {
					character.handCards.push({ type: cardType, count: 1 });
				}
			});

			character.handCardsCount = character.handCards.reduce((total, card) => total + card.count, 0);
		}

		return true;
	}
}
