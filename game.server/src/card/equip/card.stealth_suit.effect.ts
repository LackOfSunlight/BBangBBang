// cardType = 20
import { CardType } from '../../generated/common/enums';
import { getUserFromRoom, updateCharacterFromRoom, getRoom } from '../../utils/room.utils';
import { removeCard } from '../../managers/card.manager.js';

const cardStealthSuitEffect = (roomId: number, userId: string): boolean => {
	try {
		const user = getUserFromRoom(roomId, userId);
		const room = getRoom(roomId);

		// 유효성 검증
		if (!user.character || !room) {
			console.warn(`[스텔스 장치] 유저의 캐릭터 정보가 없습니다: ${userId}`);
			return false;
		}

		if (!user.character.equips.includes(CardType.STEALTH_SUIT)) {
			// 스텔스 장치 장착 (장비 ID: CardType.STEALTH_SUIT)
			user.character.equips.push(CardType.STEALTH_SUIT);
			// 카드 제거
			removeCard(user, room, CardType.STEALTH_SUIT);
		} else {
			return false;
		}

		// // 기존 스텔스 장치가 있는지 확인 (중복 착용 방지)
		// const existingStealthIndex = user.character.equips.findIndex(
		// 	(equipId) => equipId === CardType.STEALTH_SUIT,
		// );

		// if (existingStealthIndex >= 0) {
		// 	// 이미 스텔스 장치를 착용 중인 경우 - 교체 (기존 장비 제거 후 새로 추가)
		// 	user.character.equips.splice(existingStealthIndex, 1);
		// }

		updateCharacterFromRoom(roomId, user.id, user.character);
		console.log(`[스텔스 장치] ${user.nickname}이 스텔스 장치를 장착했습니다.`);
		return true;
	} catch (error) {
		console.error(`[스텔스 장치] 처리 중 오류 발생:`, error);
		return false;
	}
};

export default cardStealthSuitEffect;
