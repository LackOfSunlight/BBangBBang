import { User } from '../../models/user.model';
import { Room } from '../../models/room.model';
import { CardType } from '../../generated/common/enums';

const cardVaccineEffect = (room: Room, user: User): boolean => {
	if (!user || !room) return false;

	const HEAL_AMOUNT = 1;

	room.removeCard(user, CardType.VACCINE);

	return user.heal(HEAL_AMOUNT);
};

export default cardVaccineEffect;
