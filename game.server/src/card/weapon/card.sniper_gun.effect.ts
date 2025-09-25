// cardType = 13
import { CardType } from '../../generated/common/enums.js';
import { cardManager } from '../../managers/card.manager.js';
import { Room } from '../../models/room.model.js';
import { User } from '../../models/user.model.js';

const cardSniperGunEffect = (room: Room, user: User): boolean => {

	// 유효성 검증
	if (!user || !user.character) return false;

	if (user.character.weapon !== CardType.SNIPER_GUN) {
		user.character.weapon = CardType.SNIPER_GUN;
		cardManager.removeCard(user, room, CardType.SNIPER_GUN);
	} else {
		return false;
	}

	return true;
};

export default cardSniperGunEffect;
