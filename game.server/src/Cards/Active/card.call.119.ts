import { CardCategory } from '../../Enums/card.category';
import { CardType } from '../../Generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';
import { ICard } from '../../Type/card';

export class Call119Card implements ICard {
	type: CardType = CardType.CALL_119;
	cardCategory: CardCategory = CardCategory.targetCard;

	public useCard(room: Room, user: User, target: User): boolean {
		// 유효성 검증
		if (!user.character) return false;

		const HEAL_AMOUNT = 1;

		if (target.id !== '0') {
			if (user.character.hp >= user.character.maxHp) {
				return false;
			} else {
				user.character.addHealth(HEAL_AMOUNT);
				room.removeCard(user, CardType.CALL_119);
				return true;
			}
		} else {
			const usersToHeal = room.users.filter((u) => u.id !== user.id);
			const isHeal = usersToHeal.every((u) => u.character!.hp >= u.character!.maxHp);
			if (isHeal) return false;
			usersToHeal.map((otherUser) => otherUser.character?.addHealth(HEAL_AMOUNT));
			room.removeCard(user, CardType.CALL_119);
			return true;
		}
	}
}
