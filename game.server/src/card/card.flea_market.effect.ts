// cardType = 10
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';

const cardFleaMarketEffect = async (roomId: number, userId: string, targetUserId: string) => {
	const user = await getUserFromRoom(roomId, userId);
	const target = await getUserFromRoom(roomId, targetUserId);
	// 유효성 검증
	if (!user || !target || !target.character) return;
};

export default cardFleaMarketEffect;
