// cardType = 17
import { CardType } from '../../Generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';

const cardLaserPointerEffect = (room: Room, user: User): boolean => {
	// 유효성 검증
	if (!user.character) {
		console.log('[LASER_POINTER]사용자 정보가 존재하지 않습니다');
		return false;
	}

	if (!user.character.equips.includes(CardType.LASER_POINTER)) {
		room.removeCard(user, CardType.LASER_POINTER);
		user.character.equips.push(CardType.LASER_POINTER);
	} else {
		// 중복 착용 중일 경우
		return false;
	}

	return true;
};

export default cardLaserPointerEffect;
