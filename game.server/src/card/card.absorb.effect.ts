// cardType = 8
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';

const cardAbsorbEffect = async (roomId: number, userId: string, targetUserId: string) => {
	const user = await getUserFromRoom(roomId, userId);
	const target = await getUserFromRoom(roomId, targetUserId);
	// 유효성 검증
	if (!user || !user.character || !target || !target.character) return;

	// 대상의 손에 카드가 있는지 확인
	const targetHand = target.character.handCards;
	if (targetHand.length === 0) {
        console.log(`[흡수 실패] ${target.character}이 카드를 가지고 있지 않음:`);
		// 대상이 카드를 가지고 있지 않으면 효과가 발동하지 않음
		return;
	}

	// 대상의 손에서 무작위로 카드 한 장을 선택하여 훔침
	const randomIndex = Math.floor(Math.random() * targetHand.length);
	const stolenCard = targetHand.splice(randomIndex, 1)[0];

	// 훔친 카드를 시전자의 손에 추가
	user.character.handCards.push(stolenCard);

	// 변경된 두 유저의 정보를 Redis에 업데이트
	try {
		await updateCharacterFromRoom(roomId, userId, user.character);
		await updateCharacterFromRoom(roomId, targetUserId, target.character);
	} catch (error) {
		console.error(`[흡수] Redis 업데이트 실패:`, error);
	}
};

export default cardAbsorbEffect;