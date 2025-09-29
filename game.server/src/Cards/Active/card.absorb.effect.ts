// cardType = 8

import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';

const cardAbsorbEffect = (room: Room, user: User, targetUser: User): boolean => {
	// 유효성 검증
	if (!user || !user.character || !targetUser || !targetUser.character) return false;

	if (targetUser.character.stateInfo?.state === CharacterStateType.CONTAINED) {
		return false;
	}

	// 대상의 손에 카드가 있는지 확인
	const targetHand = targetUser.character.handCards;
	if (targetHand.length === 0) {
		console.log(`[흡수 실패] ${targetUser.character}이 카드를 가지고 있지 않음:`);
		// 대상이 카드를 가지고 있지 않으면 효과가 발동하지 않음
		return false;
	}

	room.removeCard(user, CardType.ABSORB);

	// 상태 변경
	if (!user.character.stateInfo) {
		return false;
	}
	if (!targetUser.character.stateInfo) {
		return false;
	}

	user.character.stateInfo.state = CharacterStateType.ABSORBING;
	user.character.stateInfo.stateTargetUserId = targetUser.id;
	targetUser.character.stateInfo.state = CharacterStateType.ABSORB_TARGET;

	console.log(`[흡수 성공]`);
	return true;
};

export default cardAbsorbEffect;
