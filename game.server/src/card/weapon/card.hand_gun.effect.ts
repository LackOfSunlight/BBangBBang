// cardType = 14
import { CardType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const cardHandGunEffect = (room: Room, user: User): boolean => {
	// 유효성 검증
	if (!user || !user.character) return false;

	if (user.character.weapon !== CardType.HAND_GUN) {
		// 핸드건 카드 효과: 하루에 사용할 수 있는 빵야!가 두 개로 증가
		// 무기 카드이므로 자신에게만 적용 (targetUserId 무시)
		user.character.weapon = CardType.HAND_GUN;
	} else {
		return false;
	}

	return true;
};

export default cardHandGunEffect;
