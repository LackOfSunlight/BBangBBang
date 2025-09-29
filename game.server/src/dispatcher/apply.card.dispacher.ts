import { User } from '../Models/user.model';
import { Room } from '../Models/room.model';
import cardMap from '../Converter/card.map';
import { CardType } from '../Generated/common/enums';
import { CardCategory } from '../Enums/card.category';
import { ICard } from '../Type/card';

export const cardPool: Map<CardType, ICard> = new Map<CardType, ICard>();

// 카드 효과 적용 함수
export function applyCardEffect(
	room: Room,
	CardType: CardType,
	user: User,
	targetUser: User,
): boolean {
	const card = getCard(CardType);

	if (!card) return false;

	switch (card.cardCategory) {
		case CardCategory.targetCard:
			return card.useCard(room, user, targetUser);
		case CardCategory.nonTargetCard:
			return card.useCard(room, user);
	}
}

export function getCard(cardType: CardType): ICard {
	if (cardPool.has(cardType)) {
		return cardPool.get(cardType)!;
	}

	const newCard = cardMap[cardType];

	if (newCard != null) cardPool.set(cardType, newCard);

	return newCard!;
}
