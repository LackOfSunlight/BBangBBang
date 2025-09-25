// cardType = 18
import { CardType } from '../../generated/common/enums.js';
import { cardManager } from '../../managers/card.manager';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const cardRaderEffect = (room: Room, user: User): boolean => {

	// 유효성 검증
	if (!user || !user.character) return false;

	if (!user.character.equips.includes(CardType.RADAR)) {
		user.character.equips.push(CardType.RADAR);
		cardManager.removeCard(user, room, CardType.RADAR);
	} else {
		return false;
	}

	return true;

};

export default cardRaderEffect;
