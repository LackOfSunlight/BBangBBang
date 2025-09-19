// cardType = 9
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/room.utils';

const cardHallucinationEffect = (roomId: number, userId: string, targetUserId: string) : boolean => {
	const user = getUserFromRoom(roomId, userId);
	const target = getUserFromRoom(roomId, targetUserId);
	// 유효성 검증
	if (!user || !target || !target.character) return false;

	return true;
};

export default cardHallucinationEffect;
