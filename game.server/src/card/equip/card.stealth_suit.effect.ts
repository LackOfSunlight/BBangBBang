// cardType = 20
import { CardType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const cardStealthSuitEffect = (room: Room, user: User): boolean => {
	if (!user.character) {
		return false;
	}

	if (user.character.equips.includes(CardType.STEALTH_SUIT)) return false;

	// 스텔스 장치 장착 (장비 ID: CardType.STEALTH_SUIT)
	user.character.equips.push(CardType.STEALTH_SUIT);
	room.removeCard(user, CardType.STEALTH_SUIT);

	console.log(`[스텔스 장치] ${user.nickname}이 스텔스 장치를 장착했습니다.`);
	return true;
};

export default cardStealthSuitEffect;
