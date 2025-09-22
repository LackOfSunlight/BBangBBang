// cardType = 8

import { CardType } from '../../generated/common/enums';
import { removeCard } from '../../managers/card.manager';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';

const cardAbsorbEffect = (roomId: number, userId: string, targetUserId: string): boolean => {
	const user = getUserFromRoom(roomId, userId);
	const target = getUserFromRoom(roomId, targetUserId);
	let room = getRoom(roomId)
	// 유효성 검증
	if (!user || !user.character || !target || !target.character) return false;

	// 대상의 손에 카드가 있는지 확인s
	const targetHand = target.character.handCards;
	if (targetHand.length === 0) {
		console.log(`[흡수 실패] ${target.character}이 카드를 가지고 있지 않음:`);
		// 대상이 카드를 가지고 있지 않으면 효과가 발동하지 않음
		return false;
	}

	removeCard(user, room, CardType.ABSORB)

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

	// 변경된 두 유저의 정보를 업데이트
	try {
		updateCharacterFromRoom(roomId, userId, user.character);
		updateCharacterFromRoom(roomId, targetUserId, target.character);
		return true;
	} catch (error) {
		console.error(`[흡수] 업데이트 실패:`, error);
		return false;
	}
};

export default cardAbsorbEffect;
