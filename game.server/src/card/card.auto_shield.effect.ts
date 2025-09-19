import { getUserFromRoom, updateCharacterFromRoom } from '../utils/room.utils';
import { CardType } from '../generated/common/enums';

export const equipAutoShieldEffect = (roomId: number, userId: string): boolean => {
	const user = getUserFromRoom(roomId, userId);
	// 유효성 검증
	if (!user || !user.character) {
		return false;
	}

	// 자동 쉴드 장착
	user.character.equips.push(CardType.AUTO_SHIELD);

	// 정보 업데이트3
	updateCharacterFromRoom(roomId, userId, user.character);
	return true;
};

// 피격 시 자동 쉴드의 25% 방어 확률을 계산하는 효과.
export const autoShieldBlock = (): boolean => {
	return Math.random() < 0.25;
};