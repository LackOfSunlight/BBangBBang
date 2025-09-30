import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { ICard } from '../../type/card';

export class BigBBangCard implements ICard {
	type: CardType = CardType.BIG_BBANG;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, shooter: User): boolean {
		if (!room || !shooter) {
			return false;
		}

		// "카드 사용을 막아야 하는 상태"만 정의
		const isBlockedStateUsers = room.users.some(
			(s) =>
				s.character && s.character.stateInfo?.state !== CharacterStateType.NONE_CHARACTER_STATE,
		);

		if (isBlockedStateUsers) {
			return false;
		}

		room.removeCard(shooter, CardType.BIG_BBANG);

		for (let user of room.users) {
			// 타입 가드
			if (!user.character || !user.character.stateInfo) continue;

			if (user.id === shooter.id) {
				user.character.changeState(
					CharacterStateType.BIG_BBANG_SHOOTER,
					CharacterStateType.NONE_CHARACTER_STATE,
					Number(process.env.NEXT_TIME),
				);
				continue;
			}

			if (user.character.hp > 0 && user.character.stateInfo.state != CharacterStateType.CONTAINED) {
				user.character.changeState(
					CharacterStateType.BIG_BBANG_TARGET,
					CharacterStateType.NONE_CHARACTER_STATE,
					Number(process.env.NEXT_TIME),
					shooter.id,
				);
			}
		}

		return true;
	}
}
