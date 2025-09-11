// cardType = 15
import { CardType } from '../generated/common/enums';
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util';
const cardDesertEagleEffect = async (roomId: number, userId: string) => {
	const user = await getUserFromRoom(roomId, userId);
	// 유효성 검증
	if (!user || !user.character) return;

	// 이미 데저트 이글을 장착하고 있는지 확인
	if (user.character.weapon === CardType.DESERT_EAGLE) {
		return;
	}

	// 손에서 데저트 이글 카드 찾아서 제거
	const cardIndex = user.character.handCards.findIndex(
		(card) => card.type === CardType.DESERT_EAGLE,
	);
	if (cardIndex === -1) {
		// 카드 없으면 로직 중단
		return;
	}
	user.character.handCards.splice(cardIndex, 1);

	// 데저트 이글 장착 (기존 무기는 덮어쓰기로 교체)
	user.character.weapon = CardType.DESERT_EAGLE;

	return await updateCharacterFromRoom(roomId, userId, user.character);
};

export default cardDesertEagleEffect;
