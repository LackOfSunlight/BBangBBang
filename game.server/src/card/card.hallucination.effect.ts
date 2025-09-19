// cardType = 9
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';

const cardHallucinationEffect = async (
	roomId: number,
	userId: string,
	targetUserId: string,
): Promise<boolean> => {
	const user = await getUserFromRoom(roomId, userId);
	const target = await getUserFromRoom(roomId, targetUserId);
	// 유효성 검증
	if (!user || !target || !target.character) return false;

	return true;
};

export default cardHallucinationEffect;
