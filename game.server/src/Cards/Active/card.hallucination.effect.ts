// cardType = 9

import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';

const cardHallucinationEffect = (room: Room, user: User, target: User): boolean => {
	// 유효성 검증
	if (!user.character || !target.character) return false;

	if (target.character.stateInfo?.state === CharacterStateType.CONTAINED) {
		return false;
	}

	// 대상의 손에 카드가 있는지 확인
	const targetHand = target.character.handCards;
	if (targetHand.length === 0) {
		console.log(`[신기루 실패] ${target.character}이 카드를 가지고 있지 않음:`);
		// 대상이 카드를 가지고 있지 않으면 효과가 발동하지 않음
		return false;
	}

	room.removeCard(user, CardType.HALLUCINATION);

	// 상태 변경
	user.character.stateInfo!.state = CharacterStateType.HALLUCINATING;
	user.character.stateInfo!.stateTargetUserId = target.id;
	target.character.stateInfo!.state = CharacterStateType.HALLUCINATION_TARGET;

	return true;
};

export default cardHallucinationEffect;
