// cardType = 17
import {
	getUserFromRoom,
	removeUserFromRoom,
	updateCharacterFromRoom,
} from '../utils/redis.util.js';
import { CardType } from '../generated/common/enums.js';

const cardLaserPointerEffect = async (roomId: number, userId: string): Promise<boolean> => {
	const user = await getUserFromRoom(roomId, userId);
	// 유효성 검증
	if (!user || !user.character) return false;

	// 중복 착용 중일 경우
	if (!user.character.equips.includes(CardType.LASER_POINTER)) {
		user.character.equips.push(CardType.LASER_POINTER);
	} else {
		return false;
	}

	// 수정 정보 갱신
	try {
		await updateCharacterFromRoom(roomId, userId, user.character);
		return true;
		//console.log('로그 저장에 성공하였습니다');
	} catch (error) {
		console.error(`로그 저장에 실패하였습니다:[${error}]`);
		return false;
	}
};

export default cardLaserPointerEffect;
