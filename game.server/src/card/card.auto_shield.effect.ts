import { getUserFromRoom, updateCharacterFromRoom } from '../utils/room.utils';
import { CardType } from '../generated/common/enums';

export const equipAutoShieldEffect = async (roomId: number, userId: string): Promise<boolean> => {
	const user = await getUserFromRoom(roomId, userId);

	// 유효성 검증
	if (!user || !user.character) return false;

	// 자동 쉴드 장착
	if (!user.character.equips.includes(CardType.AUTO_SHIELD)) {
		user.character.equips.push(CardType.AUTO_SHIELD);
	} else {
		return false;
	}

	// 정보 업데이트
	updateCharacterFromRoom(roomId, userId, user.character);
	return true;
};

export const AutoShieldBlock = (): boolean => {
	return Math.random() < 0.25;
};
