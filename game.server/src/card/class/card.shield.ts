import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType, CharacterType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { CheckBigBbangService } from '../../services/bigbbang.check.service';
import { ICard } from '../../type/card';

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

		if (user.character.stateInfo.state === CharacterStateType.BBANG_TARGET) {
			if (!target.character) return false;

			const requiredShields = this.requiredShieldCount(target);
			const userShields =
				user.character.handCards.find((c) => c.type === CardType.SHIELD)?.count ?? 0;

			if (userShields >= requiredShields) {
				this.removeShields(user, requiredShields);
				user.character.changeState();
				if (target.character.stateInfo) {
					target.character.changeState();
					target.character.bbangCount += 1;
				}
			}
		} else {
			room.removeCard(user, CardType.SHIELD);
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

		let requiredShields = 1;
		if (isShark && hasLaser) {
			requiredShields = Number(process.env.SynergyRequiredShield);
			console.log(requiredShields);
		} else if (isShark) {
			requiredShields = Number(process.env.SharkRequiredShield);
		} else if (hasLaser) {
			requiredShields = Number(process.env.LaserRequiredShield);
		}

		return requiredShields;
	};
}
