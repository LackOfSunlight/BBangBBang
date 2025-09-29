// cardType = 16
import { CardType } from '../../generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';

const cardAutoRifleEffect = (room: Room, user: User): boolean => {
	// 유효성 검증
	if (!user.character || !user.character.stateInfo) {
		console.error('[AUTO_RIFLE]사용자 정보가 존재하지 않습니다');
		return false;
	}

	if (user.character.weapon !== CardType.AUTO_RIFLE) {
		room.removeCard(user, CardType.AUTO_RIFLE);
		user.character.weapon = CardType.AUTO_RIFLE;
	} else {
		return false;
	}

	return true;
};

export default cardAutoRifleEffect;
