// cardType = 12
import { getUserFromRoom, updateCharacterFromRoom, getRoom } from '../../utils/room.utils';
import { drawDeck, removeCard } from '../../managers/card.manager';
import { CardType } from '../../generated/common/enums';

const cardWinLotteryEffect = (roomId: number, userId: string): boolean => {
	const user = getUserFromRoom(roomId, userId);
	const room = getRoom(roomId);

	// 유효성 검증
	if (!user || !user.character || !room) return false;

	// 카드 제거
	removeCard(user, room, CardType.WIN_LOTTERY);

	// 복권방 카드 효과: 새로운 카드 세 장을 획득
	// useTag: "Lottery"로 복권방 NPC와만 상호작용
	// targetUserId는 필요 없음 (isTargetSelect: false)

	// 덱에서 카드 3장 뽑기 (CardType[] 반환)
	const newCardTypes = drawDeck(roomId, 3);

	if (newCardTypes.length === 0) {
		console.log(`[복권 당첨] ${user.nickname}: 덱에 카드가 없습니다.`);
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

	// Redis에 업데이트된 캐릭터 정보 저장
	// S2CUserUpdateNotification으로 클라이언트에 전송됨
	try {
		updateCharacterFromRoom(roomId, user.id, user.character);
		console.log(
			`[복권 당첨] ${user.nickname}이 카드 ${newCardTypes.length}장을 획득했습니다:`,
			newCardTypes.map((type) => CardType[type]).join(', '),
		);
		return true;
	} catch (error) {
		console.error(`[복권 당첨] Redis 업데이트 실패:`, error);
		return false;
	}
};

export default cardWinLotteryEffect;
