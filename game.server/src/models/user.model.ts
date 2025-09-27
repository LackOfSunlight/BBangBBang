import { RepeatType } from '@protobuf-ts/runtime';
import { applyHeal } from '../card/CardService/applyHeal';
import { CardType, CharacterStateType } from '../generated/common/enums';
import { UserData } from '../generated/common/types';
import { CharacterData } from '../generated/common/types';
import { cardManager } from '../managers/card.manager';
import takeDamageService from '../services/take.damage.service';
import { Room } from './room.model';
import roomManager from '../managers/room.manager';

export class User implements UserData {
	id: string;
	nickname: string;
	character?: CharacterData | undefined;

	constructor(id: string, nickName: string) {
		this.id = id;
		this.nickname = nickName;
	}

	public heal(value: number): boolean {
		if (!this.character) return false;

		return applyHeal(this.character, value);
	}

	public takeDamage(shooter: CharacterData, value: number) {
		if (!this.character) return;

		takeDamageService(this.id, this.character, shooter, value);
	}

	public changeState(
		stateType: CharacterStateType = CharacterStateType.NONE_CHARACTER_STATE,
		nextState: CharacterStateType = CharacterStateType.NONE_CHARACTER_STATE,
		nextAt: number = 0,
		targetId: string = '0',
	) {
		if (!this.character || !this.character.stateInfo) return;

		this.character.stateInfo.state = stateType;
		this.character.stateInfo.nextState = nextState;
		this.character.stateInfo.nextStateAt = `${Date.now() + nextAt * 1000}`;
		this.character.stateInfo.stateTargetUserId = targetId;
	}

	public addCardToUser(cardType: CardType) {
		if (!this.character) return;

		const cardInHand = this.character.handCards.find((c) => c.type === cardType);
		if (cardInHand) {
			cardInHand.count++;
		} else {
			this.character.handCards.push({ type: cardType, count: 1 });
		}
		this.character.handCardsCount = this.character.handCards.reduce(
			(sum, card) => sum + card.count,
			0,
		);
	}

	public removeHandCard(room: Room, cardType: CardType) {
		if (!this.character || !this.character.stateInfo) return;

		const usedCard = this.character.handCards.find((c) => c.type === cardType);

		if (usedCard != undefined) {
			usedCard.count -= 1;
			cardManager.repeatDeck(room.id, [cardType]);

			if (usedCard.count <= 0) {
				this.character.handCards = this.character!.handCards.filter((c) => c.count > 0);
				this.character!.handCardsCount = this.character!.handCards.reduce(
					(sum, card) => sum + card.count,
					0,
				);
			}
		}
	}

	public trashCards(): User {
		const room = roomManager.getRoomByUser(this.id);

		if (!room || !this.character) return this;

		const excess = this.character.handCardsCount - this.character.hp;
		let toRemove = excess;

		const removedCards: { type: CardType; count: number }[] = [];

		for (let i = 0; i < this.character.handCards.length && toRemove > 0; i++) {
			const card = this.character.handCards[i];

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

		this.character.handCards = this.character.handCards.filter((c) => c.count > 0);

		removedCards.forEach((c) => {
			for (let i = 0; i < c.count; i++) {
				room.repeatDeck([c.type]);
			}
		});

		return this;
	}

	public setUserData(id: string, nickName: string, character: CharacterData) {
		this.id = id;
		this.nickname = nickName;
		this.character = character;
	}
}
