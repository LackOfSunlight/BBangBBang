// cardType = 12
import { CardType } from '../../generated/common/enums';
import { cardManager } from '../../managers/card.manager';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const cardWinLotteryEffect = (room: Room, user: User): boolean => {
	// 유효성 검증
	if (!user || !user.character || !room) return false;

	// 복권방 카드 효과: 새로운 카드 세 장을 획득
	// useTag: "Lottery"로 복권방 NPC와만 상호작용
	// targetUserId는 필요 없음 (isTargetSelect: false)

	// 덱에서 카드 3장 뽑기 (CardType[] 반환)
	const newCardTypes = cardManager.drawDeck(room.id, 3);

	if (newCardTypes.length === 0) {
		console.log(`[복권 당첨] ${user.nickname}: 덱에 카드가 없습니다.`);
		return false;
	}

	// 게임 로직에 따라 같은 타입의 카드가 있으면 count 증가, 없으면 새로 추가
	if (user.character) {
		const character = user.character;
		newCardTypes.forEach((cardType) => {
			const existingCard = character.handCards.find((card) => card.type === cardType);
			if (existingCard) {
				// 같은 타입의 카드가 이미 있으면 count 증가
				existingCard.count += 1;
			} else {
				// 새로운 타입의 카드면 배열에 새로 추가
				character.handCards.push({ type: cardType, count: 1 });
			}
		});

		// handCardsCount 업데이트 (실제 카드 개수)
		character.handCardsCount = character.handCards.reduce(
			(total, card) => total + card.count,
			0,
		);
	}

	console.log(
		`[복권 당첨] ${user.nickname}이 카드 ${newCardTypes.length}장을 획득했습니다:`,
		newCardTypes.map((type) => CardType[type]).join(', '),
	);

	return true;
};

export default cardWinLotteryEffect;
