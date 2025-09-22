import { CardType } from '../../generated/common/enums';
import { removeCard } from '../../managers/card.manager';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
const cardDesertEagleEffect = (roomId: number, userId: string): boolean => {
	try {
		const user = getUserFromRoom(roomId, userId);
		let room = getRoom(roomId);
		// 유효성 검증
		if (!user || !user.character) return false;

		if (user.character.weapon !== CardType.DESERT_EAGLE) {
			user.character.weapon = CardType.DESERT_EAGLE;
			removeCard(user, room, CardType.DESERT_EAGLE);
		} else {
			return false;
		}

		// 데저트 이글 장착 (기존 무기는 덮어쓰기로 교체)

		updateCharacterFromRoom(roomId, user.id, user.character);
		return true;
	} catch (error) {
		console.error(`[데저트 이글] 업데이트 실패:`, error);
		return false;
		// 에러가 발생해도 함수는 정상적으로 완료됨
	}
};

export default cardDesertEagleEffect;
