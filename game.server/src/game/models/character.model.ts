import { threadCpuUsage } from 'process';
import {
	AnimationType,
	CardType,
	CharacterStateType,
	CharacterType,
	RoleType,
} from '@core/generated/common/enums';
import { CardData, CharacterData, CharacterStateInfoData } from '@core/generated/common/types';
import getMaxHp from '@game/config/character.init';
import { Room } from './room.model';
import { User } from './user.model';
import { playAnimationHandler } from '@game/handlers/play.animation.handler';

// 데미지 처리 관련 타입 정의
export interface DamageContext {
	room: Room;
	user: User;
	damage: number;
	shooter?: User;
}

export interface DamageResult {
	success: boolean;
	defended: boolean;
	cardDrawn?: boolean;
	cardStolen?: boolean;
	maskManTriggered?: boolean;
}

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

	/**
	 * OOP 방식의 데미지 처리 메서드
	 * 기존 takeDamageService의 로직을 캡슐화
	 */
	public processDamage(context: DamageContext): DamageResult {
		const { room, user, damage, shooter } = context;

		// 1. 방어 시도
		const defenseResult = this.tryDefense(room, user);
		if (defenseResult.defended) {
			return { success: true, defended: true };
		}

		// 2. 데미지 적용
		this.takeDamage(damage);

		// 3. 캐릭터별 특수 능력 처리
		const abilityResult = this.handleDamageAbility(room, user, shooter);

		// 4. 사망 처리
		if (this.hp <= 0) {
			this.handleDeath(room, user);
			return {
				success: true,
				defended: false,
				maskManTriggered: abilityResult.maskManTriggered,
			};
		}

		return {
			success: true,
			defended: false,
			cardDrawn: abilityResult.cardDrawn,
			cardStolen: abilityResult.cardStolen,
		};
	}

	/**
	 * 방어 시도 로직
	 */
	private tryDefense(room: Room, user: User): DamageResult {
		const hasShield = this.equips.includes(CardType.AUTO_SHIELD);
		const isFroggy = this.characterType === CharacterType.FROGGY;

		const shieldRoll = hasShield && Math.random() < 0.25;
		const froggyRoll = isFroggy && Math.random() < 0.25;

		if (shieldRoll || froggyRoll) {
			const toRoom = room.toData();
			playAnimationHandler(toRoom.users, user.id, AnimationType.SHIELD_ANIMATION);
			return { success: true, defended: true };
		}

		return { success: true, defended: false };
	}

	/**
	 * 캐릭터별 데미지 특수 능력 처리
	 */
	private handleDamageAbility(room: Room, user: User, shooter?: User): DamageResult {
		switch (this.characterType) {
			case CharacterType.MALANG:
				return this.malangAbility(room, user);
			case CharacterType.PINK_SLIME:
				return this.pinkSlimeAbility(room, user, shooter);
			default:
				return { success: true, defended: false };
		}
	}

	/**
	 * 말랑이 특수 능력: 데미지를 받으면 덱에서 카드 1장 뽑기
	 */
	private malangAbility(room: Room, user: User): DamageResult {
		// 기존 Room과 새로운 OOP Room 모두 호환되도록 처리
		const drawMethod = (room as any).drawCards || (room as any).drawDeck;
		const newCardTypes = drawMethod ? drawMethod.call(room, 1) : [];

		if (!newCardTypes || newCardTypes.length === 0) {
			console.log(`[말랑이 특수능력] ${user.nickname}: 덱에 카드가 없습니다.`);
			return { success: true, defended: false, cardDrawn: false };
		}

		// 게임 로직에 따라 같은 타입의 카드가 있으면 count 증가, 없으면 새로 추가
		newCardTypes.forEach((cardType: CardType) => {
			const existingCard = this.handCards.find((card) => card.type === cardType);
			if (existingCard) {
				existingCard.count += 1;
			} else {
				this.handCards.push({ type: cardType, count: 1 });
			}
		});

		// handCardsCount 업데이트
		this.handCardsCount = this.handCards.reduce((total, card) => total + card.count, 0);

		return { success: true, defended: false, cardDrawn: true };
	}

	/**
	 * 핑크슬라임 특수 능력: 데미지를 받으면 공격자의 카드 1장 훔치기
	 */
	private pinkSlimeAbility(room: Room, user: User, shooter?: User): DamageResult {
		if (!shooter || !shooter.character) {
			return { success: true, defended: false, cardStolen: false };
		}

		const shooterHand = shooter.character.handCards;
		if (shooterHand.length === 0) {
			console.log(`[핑크슬라임 특수능력] ${shooter.character}이 카드를 가지고 있지 않음:`);
			return { success: true, defended: false, cardStolen: false };
		}

		// 대상의 손에서 무작위로 카드 한 장을 선택하여 훔침
		const randomIndex = Math.floor(Math.random() * shooterHand.length);
		const stolenCard = shooterHand[randomIndex];
		const stolenCardType = stolenCard.type; // Store the type before modifying the card

		// 공격자에서 카드 제거
		if (stolenCard.count > 1) {
			// 여러 장 있으면 1장만 빼오기
			stolenCard.count -= 1;
		} else {
			// 1장뿐이면 배열에서 제거
			shooterHand.splice(randomIndex, 1);
		}

		// 공격자의 handCardsCount 업데이트
		shooter.character.handCardsCount = shooter.character.handCards.reduce(
			(sum, card) => sum + card.count,
			0,
		);

		// 핑크슬라임에게 카드 추가 (addCardToUser 메서드 사용)
		this.addCardToUser(stolenCardType);

		return { success: true, defended: false, cardStolen: true };
	}

	/**
	 * 사망 처리 로직 (마스크맨 특수 능력 포함)
	 */
	private handleDeath(room: Room, user: User): void {
		const maskMan = room.users.find((u) => u.character?.characterType === CharacterType.MASK);

		if (maskMan && maskMan.character && maskMan.character.hp > 0) {
			// 마스크맨이 살아있으면 핸드 카드만 전달
			if (this.handCardsCount > 0) {
				const totalCards = this.handCardsCount;
				for (let i = 0; i < totalCards; i++) {
					const firstCard = this.handCards[0];
					if (firstCard) {
						maskMan.character.addCardToUser(firstCard.type);
						this.removeHandCard(firstCard.type);
					}
				}
			}
			// 장비, 디버프, 무기는 월드덱으로 반환
			room.returnDeadPlayerCardsToDeck(user);
		} else {
			// 마스크맨이 없거나 죽었으면 모든 카드를 월드덱으로 반환
			room.returnDeadPlayerCardsToDeck(user);
		}
	}

	public addHealth(value: number) {
		if (this.hp <= 0) return;
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
			this.handCardsCount -= 1;
			if (usedCard.count <= 0) {
				this.handCards = this!.handCards.filter((c) => c.count > 0);
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
		this.handCardsCount = this.handCards.reduce((sum, card) => sum + card.count, 0);

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
