// cardType = 18
import { CardType } from '../../Generated/common/enums.js';
import { Room } from '../../Models/room.model.js';
import { User } from '../../Models/user.model.js';

const cardRaderEffect = (room: Room, user: User): boolean => {
	// 유효성 검증
	if (!user.character) return false;

	if (user.character.equips.includes(CardType.RADAR)) return false;

	user.character.equips.push(CardType.RADAR);
	room.removeCard(user, CardType.RADAR);

	return true;
};

export default cardRaderEffect;
