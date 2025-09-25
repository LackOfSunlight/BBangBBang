// cardType = 20
import { CardType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const cardStealthSuitEffect = (room: Room, user: User): boolean => {
	// 유효성 검증
	if (!user || !user.character) {
		console.warn(`[스텔스 장치] 유저의 캐릭터 정보가 없습니다: ${user.id}`);
		return false;
	}

	if (!user.character.equips.includes(CardType.STEALTH_SUIT)) {
		// 스텔스 장치 장착 (장비 ID: CardType.STEALTH_SUIT)
		user.character.equips.push(CardType.STEALTH_SUIT);
	} else {
		return false;
	}

	console.log(`[스텔스 장치] ${user.nickname}이 스텔스 장치를 장착했습니다.`);
	return true;
};

export default cardStealthSuitEffect;
