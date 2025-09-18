import cardData from '../data/card.data.json';
import { CardData } from '../generated/common/types';
import { CardType } from '../generated/common/enums';

// This list defines the composition of the deck
const cardDefinitions: CardData[] = (cardData as any[]).map((card) => ({
	...card,
	type: CardType[card.type as keyof typeof CardType],
}));

export const roomDecks = new Map<number, CardType[]>();

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
