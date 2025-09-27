import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { IActiveTargetCard, IBuffCard } from '../../type/card';

export class Call119Card implements IActiveTargetCard {
	type: CardType = CardType.CALL_119;
	cardCategory: CardCategory = CardCategory.activeTargetCard;

	public useCard(room: Room, user: User, target: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		const HEAL_AMOUNT = 1;

		if (target.id !== '0') {
			return user.character.addHealth(HEAL_AMOUNT);
		} else {
			const usersToHeal = room.users.filter((u) => u.id !== user.id);
			usersToHeal.map((otherUser) => otherUser.character?.addHealth(HEAL_AMOUNT));
			return true;
		}
	}
}
