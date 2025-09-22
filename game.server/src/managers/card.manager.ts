import cardData from '../data/card.data.json';
import { CardData } from '../generated/common/types';
import { CardType } from '../generated/common/enums';
import { Room } from '../models/room.model';
import { User } from '../models/user.model';
import { updateCharacterFromRoom } from '../utils/room.utils';

// This list defines the composition of the deck
const cardDefinitions: CardData[] = (cardData as any[]).map((card) => ({
	...card,
	type: CardType[card.type as keyof typeof CardType],
}));

export const roomDecks = new Map<number, CardType[]>();
export const roomFleaMarketCards = new Map<number, CardType[]>();
export const fleaMarketPickIndex = new Map<number, number[]>();

export const initializeDeck = (roomId: number): void => {
	const deck: CardType[] = [];
	cardDefinitions.forEach((cardDef) => {
		// Add 'count' number of cards of 'type' to the deck
		for (let i = 0; i < cardDef.count; i++) {
			deck.push(cardDef.type);
		}
	});

	roomDecks.set(roomId, deck);
	shuffleDeck(roomId);
};

export const shuffleDeck = (roomId: number): void => {
	const deck = roomDecks.get(roomId);

	if (deck) {
		for (let i = deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[deck[i], deck[j]] = [deck[j], deck[i]];
		}
	}
};

export const drawDeck = (roomId: number, count: number): CardType[] => {
	const deck = roomDecks.get(roomId);

	if (deck) {
		if (count > deck.length) {
			count = deck.length;
		}
		return deck.splice(0, count);
	} else {
		return [];
	}
};

export const repeatDeck = (roomId: number, cards: CardType[]): void => {
	const deck = roomDecks.get(roomId);
	if (deck) deck.push(...cards);
};

export const getDeckSize = (roomId: number): number => {
	const deck = roomDecks.get(roomId);
	if (deck) return deck.length;
	else return 0;
};

export const drawSpecificCard = (roomId: number, cardType: CardType): CardType | null => {
	const deck = roomDecks.get(roomId);
	if (!deck) return null;

	// 카드 위치 찾기
	const index = deck.findIndex((c) => c === cardType);
	if (index === -1) return null;

	// 해당 카드를 덱에서 제거 후 반환
	return deck.splice(index, 1)[0];
};

export const removeCard = (user: User, room: Room, cardType: CardType) => {
	const usedCard = user.character!.handCards.find((c) => c.type === cardType);

	if (usedCard != undefined) {
		usedCard.count -= 1;
		repeatDeck(room.id, [cardType]);

		if (usedCard.count <= 0) {
			user.character!.handCards = user.character!.handCards.filter((c) => c.count > 0);
			user.character!.handCardsCount = user.character!.handCards.reduce(
				(sum, card) => sum + card.count,
				0,
			);
		}
	} else {
		console.log('해당 카드를 소유하고 있지 않습니다.');
	}
};

export const addCardToUser = (user: User, cardType: CardType) => {
	if (!user.character) {
		return;
	}
	const cardInHand = user.character.handCards.find((c) => c.type === cardType);
	if (cardInHand) {
		cardInHand.count++;
	} else {
		user.character.handCards.push({ type: cardType, count: 1 });
	}
	user.character.handCardsCount = user.character.handCards.reduce((sum, card) => sum + card.count, 0);
};
