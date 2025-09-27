// cardType = 18
import { CardType } from '../../generated/common/enums.js';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const cardRaderEffect = (room: Room, user: User): boolean => {
	// 유효성 검증
	if (!user || !user.character) return false;

	if (user.character.equips.includes(CardType.RADAR)) return false;

	user.character.equips.push(CardType.RADAR);
	room.removeCard(user, CardType.RADAR);

	return true;
};

export default cardRaderEffect;
