// cardType = 13
import { CardType } from '../../generated/common/enums.js';
import { Room } from '../../models/room.model.js';
import { User } from '../../models/user.model.js';

const cardSniperGunEffect = (room: Room, user: User): boolean => {
	// 유효성 검증
	if (!user.character) return false;

	if (user.character.weapon === CardType.SNIPER_GUN) return false;

	user.character.weapon = CardType.SNIPER_GUN;
	room.removeCard(user, CardType.SNIPER_GUN);

	return true;
};

export default cardSniperGunEffect;
