import { CardCategory } from '@game/enums/card.category';
import { CardType, CharacterStateType } from '@core/generated/common/enums';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import { ICard } from '@common/types/card';

export class GuerrillaCard implements ICard {
	type: CardType = CardType.GUERRILLA;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, shooter: User): boolean {
		const isBlockedStateUsers = room.users.some(
			(s) =>
				s.character && s.character.stateInfo?.state !== CharacterStateType.NONE_CHARACTER_STATE,
		);

		if (isBlockedStateUsers) {
			return false;
		}

		room.removeCard(shooter, CardType.GUERRILLA);

		for (let user of room.users) {
			if (!user.character || !user.character.stateInfo) continue;

			if (user.id === shooter.id) {
				user.character.changeState(
					CharacterStateType.GUERRILLA_SHOOTER,
					CharacterStateType.NONE_CHARACTER_STATE,
					Number(process.env.NEXT_TIME),
				);

				continue;
			}

			if (user.character.hp > 0 && user.character.stateInfo.state != CharacterStateType.CONTAINED) {
				user.character.changeState(
					CharacterStateType.GUERRILLA_TARGET,
					CharacterStateType.NONE_CHARACTER_STATE,
					Number(process.env.NEXT_TIME),
					shooter.id,
				);
			}
		}

		return true;
	}
}
