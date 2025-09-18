// cardType = 8
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';

const cardAbsorbEffect = async (roomId: number, userId: string, targetUserId: string) : Promise<boolean> => {
	const user = await getUserFromRoom(roomId, userId);
	const target = await getUserFromRoom(roomId, targetUserId);
	// 유효성 검증
	if (!user || !user.character || !target || !target.character) return false;

	// 대상의 손에 카드가 있는지 확인
	const targetHand = target.character.handCards;
	if (targetHand.length === 0) {
		console.log(`[흡수 실패] ${target.character}이 카드를 가지고 있지 않음:`);
		// 대상이 카드를 가지고 있지 않으면 효과가 발동하지 않음
		return false;
	}

	// 대상의 손에서 무작위로 카드 한 장을 선택하여 훔침
	const randomIndex = Math.floor(Math.random() * targetHand.length);
	const stolenCard = targetHand[randomIndex];

	if (stolenCard.count > 1) {
		// 여러 장 있으면 1장만 빼오기
		stolenCard.count -= 1;
		// 시전자 손패에 추가
		user.character.handCards.push({ type: stolenCard.type, count: 1 });
	} else {
		// 1장뿐이면 배열에서 제거
		const removed = targetHand.splice(randomIndex, 1)[0];
		user.character.handCards.push(removed);
	}

	// 변경된 두 유저의 정보를 Redis에 업데이트
	try {
		await updateCharacterFromRoom(roomId, userId, user.character);
		await updateCharacterFromRoom(roomId, targetUserId, target.character);
		return true;
	} catch (error) {
		console.error(`[흡수] Redis 업데이트 실패:`, error);
		return false;
	}
};

export default cardAbsorbEffect;
