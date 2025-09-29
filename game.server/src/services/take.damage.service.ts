import { AnimationType, CardType, CharacterType } from '../generated/common/enums';
import { playAnimationHandler } from '../handlers/play.animation.handler';
import { Room } from '../models/room.model';
import { User } from '../models/user.model';

const takeDamageService = (room: Room, user: User, damage: number, shooter?: User) => {
	let isDefended = false;

	if (!user.character) return;

	//방어 시도
	const hasShield = user.character.equips.includes(CardType.AUTO_SHIELD);
	const isFroggy = user.character.characterType === CharacterType.FROGGY;

	const shieldRoll = hasShield && Math.random() < 0.25;
	const froggyRoll = isFroggy && Math.random() < 0.25;

	if (shieldRoll || froggyRoll) {
		isDefended = true; // 둘 중 하나라도 성공하면 방어됨
		const toRoom = room.toData();
		playAnimationHandler(toRoom.users, user.id, AnimationType.SHIELD_ANIMATION);
	}

	if (isDefended) return;

	//데미지 처리
	if (user.character?.characterType === CharacterType.MALANG) {
		user.character.takeDamage(damage);
		// 덱에서 카드 1장 뽑기 (CardType[] 반환)
		const newCardTypes = room.drawDeck();

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
		user.character.takeDamage(damage);

		if (!shooter) return;
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
		user.character?.takeDamage(damage);
	}

	if (user.character.hp <= 0) {
		const maskMan = room.users.find((u) => u.character?.characterType === CharacterType.MASK);

		if (maskMan && maskMan.character!.hp > 0) {
			// 마스크맨이 살아있으면 핸드 카드만 전달
			if (user.character.handCardsCount > 0) {
				for (let i = 0; i < user.character.handCards.length; i++) {
					const card = user.character.handCards[i];

					for (let j = 0; j < card.count; j++) {
						maskMan.character?.addCardToUser(card.type);
						user.character.removeHandCard(card.type);
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
};

export default takeDamageService;
