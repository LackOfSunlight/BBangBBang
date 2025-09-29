// cardType = 14
import { CardType } from '../../Generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';

const cardHandGunEffect = (room: Room, user: User): boolean => {
	// 유효성 검증
	if (!user.character) return false;

	if (user.character.weapon !== CardType.HAND_GUN) {
		user.character.weapon = CardType.HAND_GUN;
		room.removeCard(user, CardType.HAND_GUN);
	} else {
		return false;
	}

	return true;
};

export default cardHandGunEffect;
