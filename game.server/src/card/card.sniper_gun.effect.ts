// cardType = 13
import { CardType } from '../generated/common/enums.js';
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';

const cardSniperGunEffect = async (roomId: number, userId: string) => {
	const user = await getUserFromRoom(roomId, userId);

	// 유효성 검증
	if (!user || !user.character) return;

	user.character.weapon = CardType.SNIPER_GUN;

	// Redis에 업데이트된 캐릭터 정보 저장
	try {
		await updateCharacterFromRoom(roomId, user.id, user.character);
	} catch (error) {
		console.error(`[스나이퍼] Redis 업데이트 실패:`, error);
		// 에러가 발생해도 함수는 정상적으로 완료됨
	}
};

export default cardSniperGunEffect;
