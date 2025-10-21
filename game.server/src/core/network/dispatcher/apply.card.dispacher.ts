import { User } from '@game/models/user.model';
import { Room } from '@game/models/room.model';
import cardMap from '@common/converters/card.map';
import { CardType } from '@core/generated/common/enums';
import { CardCategory } from '@game/enums/card.category';
import { ICard } from '@common/types/card';

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
