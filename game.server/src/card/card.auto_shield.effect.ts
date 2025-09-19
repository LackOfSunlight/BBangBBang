import { getUserFromRoom, updateCharacterFromRoom } from '../utils/room.utils';
import { CardType } from '../generated/common/enums';

/**
 * 자동 쉴드 카드를 장착하는 효과.
 * @returns 장착 성공 시 true, 이미 장착 중이거나 유저 정보가 없으면 false.
 */
export const equipAutoShieldEffect = async (roomId: number, userId: string): Promise<boolean> => {
	const user = await getUserFromRoom(roomId, userId);
	// 유효성 검증
	if (!user || !user.character) {
		return false;
	}

	// 자동 쉴드 장착
	user.character.equips.push(CardType.AUTO_SHIELD);

	// 정보 업데이트
	await updateCharacterFromRoom(roomId, userId, user.character);
	return true;
};


export const AutoShieldBlock = (): boolean => {
	return Math.random() < 0.25;
};