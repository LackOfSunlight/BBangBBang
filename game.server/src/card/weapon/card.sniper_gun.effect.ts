// cardType = 13
import { CardType } from '../../generated/common/enums.js';
import { cardManager } from '../../managers/card.manager.js';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils.js';

const cardSniperGunEffect = (roomId: number, userId: string): boolean => {
	const user = getUserFromRoom(roomId, userId);
	const room = getRoom(roomId);

	// 유효성 검증
	if (!user || !user.character) return false;

	if (user.character.weapon !== CardType.SNIPER_GUN) {
		user.character.weapon = CardType.SNIPER_GUN;
		cardManager.removeCard(user, room, CardType.SNIPER_GUN);
	} else {
		return false;
	}

	// 업데이트된 캐릭터 정보 저장
	try {
		updateCharacterFromRoom(roomId, user.id, user.character);
		return true;
	} catch (error) {
		console.error(`[스나이퍼] 업데이트 실패:`, error);
		// 에러가 발생해도 함수는 정상적으로 완료됨
		return false;
	}
};

export default cardSniperGunEffect;
