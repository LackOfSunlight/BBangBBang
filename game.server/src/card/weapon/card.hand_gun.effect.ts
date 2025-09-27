// cardType = 14
import { CardType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const cardHandGunEffect = (room: Room, user: User): boolean => {
	// 유효성 검증
	if (!user || !user.character) return false;

	if (user.character.weapon !== CardType.HAND_GUN) {
		user.character.weapon = CardType.HAND_GUN;
		room.removeCard(user, CardType.HAND_GUN);
	} else {
		return false;
	}

	return true;
};

export default cardHandGunEffect;
