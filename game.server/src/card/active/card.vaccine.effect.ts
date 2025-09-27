import { User } from '../../models/user.model';
import { Room } from '../../models/room.model';
import { applyHeal } from '../CardService/applyHeal';
import { cardManager } from '../../managers/card.manager';
import { CardType, SelectCardType } from '../../generated/common/enums';

const cardVaccineEffect = (room: Room, user: User): boolean => {
	if (!user || !room) return false;

	const HEAL_AMOUNT = 1;

	cardManager.removeCard(user, room, CardType.VACCINE);

	return user.heal(HEAL_AMOUNT);
};

export default cardVaccineEffect;
