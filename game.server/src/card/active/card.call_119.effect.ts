// cardType = 5
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { applyHeal } from '../CardService/applyHeal';

const cardCall119Effect = (room: Room, user: User, targetUser: User): boolean => {
	// 유효성 검증
	if (!user || !user.character || !room) return false;

	const HEAL_AMOUNT = 1;

	if (targetUser.id !== '0') {
		return applyHeal(user, HEAL_AMOUNT);
	}
	// '모두에게 사용'
	else {
		// 자신을 제외한 모든 유저를 순회하며 회복 시도
		const result = room.users
			.filter((u) => u.id !== user.id)
			.map((otherUser) => applyHeal(otherUser, HEAL_AMOUNT));

		return result.some((success) => success === true);
	}
};

export default cardCall119Effect;
