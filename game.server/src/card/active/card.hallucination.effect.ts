// cardType = 9

import { CardType, CharacterStateType } from '../../generated/common/enums';
import { cardManager } from '../../managers/card.manager';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';

const cardHallucinationEffect = (roomId: number, userId: string, targetUserId: string): boolean => {
	const user = getUserFromRoom(roomId, userId);
	const target = getUserFromRoom(roomId, targetUserId);
	let room = getRoom(roomId);
	
	// 유효성 검증
	if (!user || !user.character || !target || !target.character) return false;

	if(target.character.stateInfo?.state === CharacterStateType.CONTAINED){
		return false;
	}

	// 대상의 손에 카드가 있는지 확인
	const targetHand = target.character.handCards;
	if (targetHand.length === 0) {
		console.log(`[신기루 실패] ${target.character}이 카드를 가지고 있지 않음:`);
		// 대상이 카드를 가지고 있지 않으면 효과가 발동하지 않음
		return false;
	}

	cardManager.removeCard(user, room, CardType.HALLUCINATION);

	// 상태 변경
	user.character.stateInfo!.state = CharacterStateType.HALLUCINATING;
	user.character.stateInfo!.stateTargetUserId = targetUserId;
	target.character.stateInfo!.state = CharacterStateType.HALLUCINATION_TARGET;

	// 변경된 두 유저의 정보를 업데이트
	try {
		updateCharacterFromRoom(roomId, userId, user.character);
		updateCharacterFromRoom(roomId, targetUserId, target.character);
		return true;
	} catch (error) {
		console.error(`[신기루] 업데이트 실패:`, error);
		return false;
	}
};

export default cardHallucinationEffect;
