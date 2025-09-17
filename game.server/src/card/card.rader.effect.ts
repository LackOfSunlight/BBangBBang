// cardType = 18
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';
import { CardType } from '../generated/common/enums.js';

const cardRaderEffect = async (roomId: number, userId: string): Promise<boolean> => {
	const user = await getUserFromRoom(roomId, userId);

	// 유효성 검증
	if (!user || !user.character) return false;

	if (!user.character.equips.includes(CardType.RADAR)) {
		user.character.equips.push(CardType.RADAR);
	} else{
		return false;
	}

	// Redis에 업데이트된 캐릭터 정보 저장
	try {
		await updateCharacterFromRoom(roomId, user.id, user.character);
		return true;
	} catch (error) {
		console.error(`[레이더] Redis 업데이트 실패:`, error);
		// 에러가 발생해도 함수는 정상적으로 완료됨
		return false;
	}
};

export default cardRaderEffect;
