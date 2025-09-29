import { threadCpuUsage } from 'process';
import { CardType, CharacterStateType, CharacterType, RoleType } from '../Generated/common/enums';
import { CardData, CharacterData, CharacterStateInfoData } from '../Generated/common/types';
import getMaxHp from '../Init/character.Init';
import { Room } from './room.model';

export class Character {
	characterType: CharacterType;
	roleType: RoleType;
	hp: number;
	weapon: number;

	stateInfo: CharacterStateInfoData;

	equips: number[];
	debuffs: number[];
	handCards: CardData[];
	bbangCount: number;
	handCardsCount: number;

	maxHp: number = 4;

	constructor(
		characterType: CharacterType,
		roleType: RoleType,
		hp: number,
		weapon: number,
		stateInfo: CharacterStateInfoData,
		equips: number[],
		debuffs: number[],
		handCards: CardData[],
		bbangCount: number,
		handCardsCount: number,
	) {
		this.characterType = characterType;
		this.roleType = roleType;
		this.hp = hp;
		this.weapon = weapon;
		this.stateInfo = stateInfo;
		this.equips = equips;
		this.debuffs = debuffs;
		this.bbangCount = bbangCount;
		this.handCards = handCards;
		this.handCardsCount = handCardsCount;

		this.maxHp = getMaxHp(this.characterType);
	}

	public addHealth(value: number) {
		this.hp = Math.min(this.hp + value, this.maxHp);
	}

	public takeDamage(value: number = 1) {
		this.hp -= value;

		if (this.hp <= 0) {
			this.hp = 0;
		}
	}

	public changeState(
		stateType: CharacterStateType = CharacterStateType.NONE_CHARACTER_STATE,
		nextState: CharacterStateType = CharacterStateType.NONE_CHARACTER_STATE,
		nextAt: number = 0,
		targetId: string = '0',
	) {
		if (!this || !this.stateInfo) return;

		this.stateInfo.state = stateType;
		this.stateInfo.nextState = nextState;
		this.stateInfo.nextStateAt = `${Date.now() + nextAt * 1000}`;
		this.stateInfo.stateTargetUserId = targetId;
	}

	public addCardToUser(cardType: CardType) {
		if (!this) return;

		const cardInHand = this.handCards.find((c) => c.type === cardType);
		if (cardInHand) {
			cardInHand.count++;
		} else {
			this.handCards.push({ type: cardType, count: 1 });
		}
		this.handCardsCount = this.handCards.reduce((sum, card) => sum + card.count, 0);
	}

	public removeHandCard(cardType: CardType) {
		const usedCard = this.handCards.find((c) => c.type === cardType);

		if (usedCard != undefined) {
			usedCard.count -= 1;

			if (usedCard.count <= 0) {
				this.handCards = this!.handCards.filter((c) => c.count > 0);
				this!.handCardsCount = this!.handCards.reduce((sum, card) => sum + card.count, 0);
			}
		}
	}

	public trashCards(): CardData[] {
		const excess = this.handCardsCount - this.hp;
		let toRemove = excess;

		const removedCards: CardData[] = [];

		for (let i = 0; i < this.handCards.length && toRemove > 0; i++) {
			const card = this.handCards[i];

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

		this.handCards = this.handCards.filter((c) => c.count > 0);

		return removedCards;
	}

	public toData(): CharacterData {
		return {
			characterType: this.characterType,
			roleType: this.roleType,
			hp: this.hp,
			weapon: this.weapon,
			stateInfo: this.stateInfo,
			equips: this.equips,
			debuffs: this.debuffs,
			handCards: this.handCards,
			bbangCount: this.bbangCount,
			handCardsCount: this.handCardsCount,
		};
	}
}
