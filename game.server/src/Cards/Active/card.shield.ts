import { CardCategory } from '../../Enums/card.category';
import { CardType, CharacterStateType, CharacterType } from '../../generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';
import { CheckBigBbangService } from '../../Services/bigbbang.check.service';
import { ICard } from '../../Type/card';

export class ShieldCard implements ICard {
	type: CardType = CardType.SHIELD;
	cardCategory: CardCategory = CardCategory.targetCard;

	public useCard(room: Room, user: User, target: User): boolean {
		if (!user.character || !user.character.stateInfo) return false;

		if (
			user.character.stateInfo.state === CharacterStateType.NONE_CHARACTER_STATE ||
			user.character.stateInfo.state === undefined
		) {
			return false;
		}

		room.removeCard(user, CardType.SHIELD);

		if (user.character.stateInfo.state === CharacterStateType.BBANG_TARGET) {
			// const shooter = room.users.find((u) => u.id === user.character?.stateInfo?.stateTargetUserId);

			if (!target.character) return false;

			const requiredShields = this.requiredShieldCount(target);

			if (requiredShields > 0) {
				this.removeShields(user, requiredShields);
			}

			user.character.changeState();

			if (target.character.stateInfo) {
				target.character.changeState();
				target.character.bbangCount += 1;
			}
		} else {
			user.character.changeState();
		}

		room = CheckBigBbangService(room);

		return true;
	}

	removeShields = (user: User, count: number) => {
		const shieldCard = user.character?.handCards.find((c) => c.type === CardType.SHIELD);

		if (!shieldCard) return;

		if (shieldCard.count > count) {
			shieldCard.count -= count;
		} else {
			user.character!.handCards = user.character!.handCards.filter(
				(c) => c.type !== CardType.SHIELD,
			);
		}
	};

	requiredShieldCount = (shooter: User): number => {
		// 이전에 shooter 상태를 체크해서 shooter는 undefined 일 수 없음
		// 그리고 이 함수는 여기서만 사용함
		const isShark = shooter!.character!.characterType === CharacterType.SHARK;
		const hasLaser = shooter!.character!.equips.includes(CardType.LASER_POINTER);

		let requiredShields = 0;
		if (isShark) requiredShields += 1;
		if (hasLaser) requiredShields += 1;
		if (isShark && hasLaser) requiredShields += 1;

		return requiredShields;
	};
}
