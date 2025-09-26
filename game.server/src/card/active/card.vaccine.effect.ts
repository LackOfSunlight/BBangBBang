import { User } from '../../models/user.model';
import { Room } from '../../models/room.model';
import { applyHeal } from '../CardService/applyHeal';

const cardVaccineEffect = (room: Room, user: User): boolean => {
	if (!user || !room) return false;

	const HEAL_AMOUNT = 1;
	return applyHeal(user, HEAL_AMOUNT);
};

export default cardVaccineEffect;
