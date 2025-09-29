import { CardCategory } from '../../Enums/card.category';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';
import { ICard } from '../../Type/card';

export class FleaMarketCard implements ICard {
	type: CardType = CardType.BIG_BBANG;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, user: User): boolean {
		// 방에 유저들 정보 가져오기
		const users = room.users;

		if (!users || users.length === 0) return false;

		room.removeCard(user, CardType.FLEA_MARKET);

		const prisonCount = users.reduce(
			(count, u) =>
				count + (u.character?.stateInfo?.state === CharacterStateType.CONTAINED ? 1 : 0),
			0,
		);

		// 방 수 만큼 카드 드로우
		const selectedCards = room.drawDeck(users.length - prisonCount);
		if (!selectedCards || !room.roomFleaMarketCards || !room.fleaMarketPickIndex) return false;
		room.roomFleaMarketCards.push(...selectedCards);

		if (user.character === undefined || user.character.stateInfo == undefined) return false;

		user.character.changeState(
			CharacterStateType.FLEA_MARKET_TURN,
			CharacterStateType.FLEA_MARKET_WAIT,
			5,
		);

		for (let i = 0; i < room.users.length; i++) {
			const otherUser = room.users[i];

			if (!otherUser.character || !otherUser.character.stateInfo) continue;

			if (
				otherUser.id === user.id ||
				otherUser.character.stateInfo.state === CharacterStateType.CONTAINED
			) {
				continue;
			}

			otherUser.character.changeState(
				CharacterStateType.FLEA_MARKET_WAIT,
				CharacterStateType.FLEA_MARKET_TURN,
				5,
			);
		}

		return true;
	}
}
