// cardType = 3
import { CardType, CharacterStateType, CharacterType } from '../../generated/common/enums.js';
import { CheckBigBbangService as checkBigBbangService } from '../../services/bigbbang.check.service.js';
import { User } from '../../models/user.model.js';
import { cardManager } from '../../managers/card.manager.js';
import { Room } from '../../models/room.model.js';
import { stateChangeService } from '../../services/state.change.service.js';

const cardShieldEffect = (room: Room, user: User, targetUser: User): boolean => {
	if (!room || !user || !targetUser) return false;

	if (!user.character || !user.character.stateInfo) return false;

	if (
		user.character.stateInfo.state === CharacterStateType.NONE_CHARACTER_STATE ||
		user.character.stateInfo.state === undefined
	) {
		return false;
	}

	cardManager.removeCard(user, room, CardType.SHIELD);

	if (user.character.stateInfo.state === CharacterStateType.BBANG_TARGET) {
		const shooter = room.users.find((u) => u.id === user.character?.stateInfo?.stateTargetUserId);

		if (!shooter?.character) return false;

		const isShark = shooter.character.characterType === CharacterType.SHARK;
		const hasLaser = shooter.character.equips.includes(CardType.LASER_POINTER);

		let requiredShields = 0;
		if (isShark) requiredShields += 1;
		if (hasLaser) requiredShields += 1;

		if (requiredShields > 0) {
			removeShields(user, requiredShields);
		}

		stateChangeService(user);

		if (shooter.character.stateInfo) {
			stateChangeService(shooter);
			shooter.character.bbangCount += 1;
		}
	} else {
		stateChangeService(user);
	}

	room = checkBigBbangService(room);

	return true;
};

const removeShields = (user: User, count: number) => {
	const shieldCard = user.character?.handCards.find((c) => c.type === CardType.SHIELD);

	if (!shieldCard) return;

	if (shieldCard.count > count) {
		shieldCard.count -= count;
	} else {
		user.character!.handCards = user.character!.handCards.filter((c) => c.type !== CardType.SHIELD);
	}
};

export default cardShieldEffect;
