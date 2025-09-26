// cardType = 20
import { CardType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const cardStealthSuitEffect = (room: Room, user: User): boolean => {
	if (!user || !user.character) {
		return false;
	}

	if (!user.character.equips.includes(CardType.STEALTH_SUIT)) {
		user.character.equips.push(CardType.STEALTH_SUIT);
	} else {
		return false;
	}
	return true;
};

export default cardStealthSuitEffect;
