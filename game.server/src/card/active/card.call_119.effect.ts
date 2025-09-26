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
	else {
		const usersToHeal = room.users.filter((u) => u.id !== user.id);
		const result = usersToHeal.map((otherUser) => applyHeal(otherUser, HEAL_AMOUNT));

		return true;
	}
};

export default cardCall119Effect;