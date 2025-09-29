import { CardType } from '../../Generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';

const cardDesertEagleEffect = (room: Room, user: User): boolean => {
	// 유효성 검증
	if (!user.character) return false;

	if (user.character.weapon !== CardType.DESERT_EAGLE) {
		user.character.weapon = CardType.DESERT_EAGLE;
		room.removeCard(user, CardType.DESERT_EAGLE);
	} else {
		return false;
	}

	console.log(`데저트 이글 장착`);
	return true;
};

export default cardDesertEagleEffect;
