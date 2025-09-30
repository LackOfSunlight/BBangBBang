import { CardCategory } from '../../enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { ICard } from '../../type/card';

export class HallucinationCard implements ICard {
	type: CardType = CardType.BBANG;
	cardCategory: CardCategory = CardCategory.targetCard;

	public useCard(room: Room, user: User, target: User): boolean {
		// 유효성 검증
		if (!user.character || !target.character) return false;

		if (
			target.character.stateInfo?.state === CharacterStateType.CONTAINED ||
			target.character.stateInfo.state !== CharacterStateType.NONE_CHARACTER_STATE
		) {
			return false;
		}

		// 대상의 손에 카드가 있는지 확인
		const targetHand = target.character.handCards;
		if (targetHand.length === 0) {
			console.log(`[신기루 실패] ${target.character}이 카드를 가지고 있지 않음:`);
			// 대상이 카드를 가지고 있지 않으면 효과가 발동하지 않음
			return false;
		}

		room.removeCard(user, CardType.HALLUCINATION);

		// 상태 변경
		user.character.changeState(
			CharacterStateType.HALLUCINATING,
			CharacterStateType.NONE_CHARACTER_STATE,
			Number(process.env.NEXT_TIME),
			target.id,
		);

		target.character.changeState(
			CharacterStateType.HALLUCINATION_TARGET,
			CharacterStateType.NONE_CHARACTER_STATE,
			Number(process.env.NEXT_TIME),
			user.id,
		);

		return true;
	}
}
