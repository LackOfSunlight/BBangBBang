import { CardCategory } from '../../Enums/card.category';
import { CardType, CharacterStateType } from '../../Generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';
import { ICard } from '../../Type/card';

export class MaturedSavingsCard implements ICard {
	type: CardType = CardType.BIG_BBANG;
	cardCategory: CardCategory = CardCategory.nonTargetCard;

	public useCard(room: Room, user: User): boolean {
		// 유효성 검증
		if (!user.character) {
			console.error('[MATURED_SAVINGS]잘못된 사용자 정보입니다');
			return false;
		}

		room.removeCard(user, CardType.MATURED_SAVINGS);
		// 뽑을 카드 매수
		const numberOfDraw = 2;
		// 덱에 남은 카드 매수
		const remainCardNumberInDeck = room.getDeckSize();
		// 덱 매수 부족할 경우 중단
		if (remainCardNumberInDeck < numberOfDraw) {
			console.error(`[MATURED_SAVINGS]덱에서 뽑을 카드가 부족합니다.`);
			return false;
		}

		// 카드 2장 뽑기(메인 기믹) 공지
		const drawnCards = room.drawDeck(numberOfDraw);
		console.log(
			`[MATURED_SAVINGS]유저 ${user.id}(이)가 카드 ${numberOfDraw}장을 획득하였습니다\n획득 카드 : `,
		);

		// 뽑은 카드 정리 및 공지
		drawnCards.forEach((cardType) => {
			const ownedCards = user.character!.handCards.find((c) => c.type === cardType);
			// 소지중인 카드와 겹친다면 해당 카드 수에 가산
			if (ownedCards) ownedCards.count += 1;
			// 없다면 카드를 소지 카드 목록에 추가
			else user.character!.handCards.push({ type: cardType, count: 1 });

			console.log(`[${CardType[cardType]}]`);
		});

		// handCardsCount 업데이트
		user.character.handCardsCount = user.character!.handCards.reduce(
			(sum, card) => sum + card.count,
			0,
		);

		return true;
	}
}
