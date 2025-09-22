import { autoShieldBlock } from '../card/equip/card.auto_shield.effect';
import { AnimationType, CardType, CharacterType } from '../generated/common/enums';
import { playAnimationHandler } from '../handlers/play.animation.handler';
import { drawDeck } from '../managers/card.manager';
import { Room } from '../models/room.model';
import { User } from '../models/user.model';

const takeDamageService = (room: Room, user: User, shooter: User, damage: number) => {
	let isDefended = false;

	//방어 시도
	const hasShield = user.character!.equips.includes(CardType.AUTO_SHIELD);
	const isFroggy = user.character!.characterType === CharacterType.FROGGY;

	const shieldRoll = hasShield && autoShieldBlock();
	const froggyRoll = isFroggy && Math.random() < 0.25;

	if (shieldRoll || froggyRoll) {
		isDefended = true; // 둘 중 하나라도 성공하면 방어됨
		playAnimationHandler(room.users, user.id, AnimationType.SHIELD_ANIMATION);
	}

	if (isDefended) return;

	//데미지 처리
	if (user.character?.characterType === CharacterType.MALANG) {
		user.character.hp -= damage;
		// 덱에서 카드 1장 뽑기 (CardType[] 반환)
		const newCardTypes = drawDeck(room.id, 1);

		if (newCardTypes.length === 0) {
			console.log(`[말랑이 특수능력] ${user.nickname}: 덱에 카드가 없습니다.`);
			return false;
		}

		// 게임 로직에 따라 같은 타입의 카드가 있으면 count 증가, 없으면 새로 추가
		newCardTypes.forEach((cardType) => {
			const existingCard = user.character!.handCards.find((card) => card.type === cardType);
			if (existingCard) {
				// 같은 타입의 카드가 이미 있으면 count 증가
				existingCard.count += 1;
			} else {
				// 새로운 타입의 카드면 배열에 새로 추가
				user.character!.handCards.push({ type: cardType, count: 1 });
			}
		});

		// handCardsCount 업데이트 (실제 카드 개수)
		user.character!.handCardsCount = user.character!.handCards.reduce(
			(total, card) => total + card.count,
			0,
		);
	} else if (user.character?.characterType == CharacterType.PINK_SLIME) {
		user.character.hp -= damage;
		// 대상의 손에 카드가 있는지 확인s
		const shooterHand = shooter.character!.handCards;
		if (shooterHand.length === 0) {
			console.log(`[핑크슬라임 특수능력] ${shooter.character}이 카드를 가지고 있지 않음:`);
			// 대상이 카드를 가지고 있지 않으면 효과가 발동하지 않음
			return false;
		}

		// 대상의 손에서 무작위로 카드 한 장을 선택하여 훔침
		const randomIndex = Math.floor(Math.random() * shooterHand.length);
		const stolenCard = shooterHand[randomIndex];

		if (stolenCard.count > 1) {
			// 여러 장 있으면 1장만 빼오기
			stolenCard.count -= 1;
			// 시전자 손패에 추가
			user.character.handCards.push({ type: stolenCard.type, count: 1 });
		} else {
			// 1장뿐이면 배열에서 제거
			const removed = shooterHand.splice(randomIndex, 1)[0];
			user.character.handCards.push(removed);
		}
	} else {
		user.character!.hp -= damage;
	}
};

export default takeDamageService;
