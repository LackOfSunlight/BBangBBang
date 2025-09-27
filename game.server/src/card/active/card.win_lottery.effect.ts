// cardType = 12
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const LOTTERY_CARD_COUNT = 3;

const cardWinLotteryEffect = (room: Room, user: User): boolean => {
	// 유효성 검증
	if (!user || !user.character || !room) return false;

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
};

export default cardWinLotteryEffect;
