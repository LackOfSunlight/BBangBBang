// cardType = 19
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';
import { CardType } from '../generated/common/enums';

const cardAutoShieldEffect = async (roomId: number, userId: string) => {
	const user = await getUserFromRoom(roomId, userId);
	// 유효성 검증
	if (!user || !user.character) return;

	// 이미 장착하고 있다면 중복 장착 방지 => 클라이언트 로직에서 중복시 새로운걸 장착하고 원래있던걸 월드덱으로 반환해서 해당 로직 주석 처리
	// if (user.character.equips.includes(CardType.AUTO_SHIELD)) {
	// 	return;
	// }

	// 손에서 자동 쉴드 카드 찾아서 제거
	const cardIndex = user.character.handCards.findIndex((card) => card.type === CardType.AUTO_SHIELD);
	if (cardIndex === -1) {
		// 카드 없으면 로직 중단
		return;
	}
	user.character.handCards.splice(cardIndex, 1);

	// 자동 쉴드 장착
	user.character.equips.push(CardType.AUTO_SHIELD);

	// 정보 업데이트
	await updateCharacterFromRoom(roomId, userId, user.character);
};

export default cardAutoShieldEffect;