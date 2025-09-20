// cardType = 17
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../utils/room.utils';
import { CardType } from '../generated/common/enums';
import { removeCard } from '../managers/card.manager';

const cardLaserPointerEffect = (roomId: number, userId: string) : boolean => {
	const user = getUserFromRoom(roomId, userId);
	const room = getRoom(roomId);
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
		removeCard(user, room, CardType.LASER_POINTER);
	} else {
		// 중복 착용 중일 경우
		return false;
	}

	// 수정 정보 갱신
	try{
		updateCharacterFromRoom(roomId, userId, user.character);
		return true;
		//console.log('[LASER_POINTER]로그 저장에 성공하였습니다');
	} catch (error) {
		console.error(`[LASER_POINTER]로그 저장에 실패하였습니다:[${error}]`);
		return false;
	}
};

export default cardLaserPointerEffect;
