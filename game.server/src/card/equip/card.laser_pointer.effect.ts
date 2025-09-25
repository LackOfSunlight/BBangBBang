// cardType = 17
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { CardType } from '../../generated/common/enums';
import { cardManager } from '../../managers/card.manager';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const cardLaserPointerEffect = (room: Room, user: User) : boolean => {

	// 유효성 검증
	if (!user || !user.character) {
		console.log('[LASER_POINTER]사용자 정보가 존재하지 않습니다');
		return false;
	}
	if (!room) {
		console.log('[LASER_POINTER]방이 존재하지 않습니다.');
		return false;
	}

	if (!user.character.equips.includes(CardType.LASER_POINTER)) {
		user.character.equips.push(CardType.LASER_POINTER);
		
		// 카드 제거
		//cardManager.removeCard(user, room, CardType.LASER_POINTER);
	} else {
		// 중복 착용 중일 경우
		return false;
	}

	return true;
};

export default cardLaserPointerEffect;
