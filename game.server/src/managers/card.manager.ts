import cardData from '../data/card.data.json';
import { CardData } from '../generated/common/types';
import { CardType } from '../generated/common/enums';
import { Room } from '../models/room.model';
import { User } from '../models/user.model';

// This list defines the composition of the deck
const cardDefinitions: CardData[] = (cardData as any[]).map((card) => ({
	...card,
	type: CardType[card.type as keyof typeof CardType],
}));

class CardManager {
	private static instance: CardManager;

	public roomDecks = new Map<number, CardType[]>();
	public roomFleaMarketCards = new Map<number, CardType[]>();
	public fleaMarketPickIndex = new Map<number, number[]>();

	private constructor() {}

	public static getInstance(): CardManager {
		if (!CardManager.instance) {
			CardManager.instance = new CardManager();
		}
		return CardManager.instance;
	}

	public initializeDeck(roomId: number): void {
		const deck: CardType[] = [];
		cardDefinitions.forEach((cardDef) => {
			// Add 'count' number of cards of 'type' to the deck
			for (let i = 0; i < cardDef.count; i++) {
				deck.push(cardDef.type);
			}
		});

		this.roomDecks.set(roomId, deck);
		this.shuffleDeck(roomId);
	}

	public shuffleDeck(roomId: number): void {
		const deck = this.roomDecks.get(roomId);

		if (deck) {
			for (let i = deck.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[deck[i], deck[j]] = [deck[j], deck[i]];
			}
		}
	}

	public drawDeck(roomId: number, count: number): CardType[] {
		const deck = this.roomDecks.get(roomId);

		if (deck) {
			if (count > deck.length) {
				count = deck.length;
			}
			return deck.splice(0, count);
		} else {
			return [];
		}
	}

	public repeatDeck(roomId: number, cards: CardType[]): void {
		const deck = this.roomDecks.get(roomId);
		if (deck) deck.push(...cards);
	}

	public getDeckSize(roomId: number): number {
		const deck = this.roomDecks.get(roomId);
		if (deck) return deck.length;
		else return 0;
	}

	public drawSpecificCard(roomId: number, cardType: CardType): CardType | null {
		const deck = this.roomDecks.get(roomId);
		if (!deck) return null;

		// 카드 위치 찾기
		const index = deck.findIndex((c) => c === cardType);
		if (index === -1) return null;

		// 해당 카드를 덱에서 제거 후 반환
		return deck.splice(index, 1)[0];
	}

	public removeCard(user: User, room: Room, cardType: CardType) {
		const usedCard = user.character!.handCards.find((c) => c.type === cardType);

		if (usedCard != undefined) {
			usedCard.count -= 1;
			this.repeatDeck(room.id, [cardType]);

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
	}

	public addCardToUser(user: User, cardType: CardType) {
		if (!user.character) {
			return;
		}
		const cardInHand = user.character.handCards.find((c) => c.type === cardType);
		if (cardInHand) {
			cardInHand.count++;
		} else {
			user.character.handCards.push({ type: cardType, count: 1 });
		}
		user.character.handCardsCount = user.character.handCards.reduce(
			(sum, card) => sum + card.count,
			0,
		);
	}

	public trashCards(room: Room, user: User): User {
		if (!user || !user.character) return user;

		const excess = user.character.handCardsCount - user.character.hp;
		let toRemove = excess;

		const removedCards: { type: CardType; count: number }[] = [];

		for (let i = 0; i < user.character.handCards.length && toRemove > 0; i++) {
			const card = user.character.handCards[i];

			if (card.count <= toRemove) {
				removedCards.push({ type: card.type, count: card.count });
				toRemove -= card.count;
				card.count = 0;
			} else {
				removedCards.push({ type: card.type, count: toRemove });
				card.count -= toRemove;
				toRemove = 0;
			}
		}

		user.character.handCards = user.character.handCards.filter((c) => c.count > 0);
		removedCards.forEach((c) => {
			for (let i = 0; i < c.count; i++) {
				cardManager.repeatDeck(room.id, [c.type]);
			}
		});

		return user;
	}
}

export const cardManager = CardManager.getInstance();
