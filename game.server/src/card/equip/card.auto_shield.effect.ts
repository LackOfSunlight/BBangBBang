import { CardType } from '../../generated/common/enums';
import { cardManager } from '../../managers/card.manager';
import { User } from '../../models/user.model';
import { Room } from '../../models/room.model';

const cardAutoShieldEffect = (room: Room, user: User): boolean => {
	if (!user || !user.character) {
		console.warn(`[자동 방패] 유저 또는 캐릭터 정보를 찾을 수 없습니다: ${user}`);
		return false;
	}

	if (user.character.equips.includes(CardType.AUTO_SHIELD)) {
		console.log(`[자동 방패] ${user.nickname}님은 이미 자동 방패를 장착하고 있습니다.`);
		return false;
	}

	// 자동 방패 장착
	user.character.equips.push(CardType.AUTO_SHIELD);
	// 조건 만족 시 카드 제거
	cardManager.removeCard(user, room, CardType.AUTO_SHIELD);

	// 정보 업데이트
	console.log(`[자동 방패] ${user.nickname}님이 자동 방패를 장착했습니다.`);
	return true;
};

export default cardAutoShieldEffect;
