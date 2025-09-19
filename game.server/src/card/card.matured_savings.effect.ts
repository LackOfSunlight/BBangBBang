// cardType = 11
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/room.utils';
import { drawDeck, getDeckSize } from '../managers/card.manager.js';
import { CardType } from '../generated/common/enums.js';

const cardMaturedSavingsEffect = (roomId: number, userId: string): boolean => {
	const user = getUserFromRoom(roomId, userId);
	// 유효성 검증
	if (!user) {
		console.warn('[만기 적금]잘못된 사용자 정보입니다');
		return false;
	}

	// 뽑을 카드 매수
	const numberOfDraw = 2;
	// 덱에 남은 카드 매수
	const remainCardNumberInDeck = getDeckSize(roomId);
	// 덱 매수 부족할 경우 중단
	if (remainCardNumberInDeck < numberOfDraw) {
		console.warn(`[만기 적금]덱에서 뽑을 카드가 부족합니다.`);
		return false;
	}

	// 카드 2장 뽑기(메인 기믹) 공지
	const cardYouDraw = drawDeck(roomId, numberOfDraw);
	console.log(`[만기 적금]유저 ${user.id}(이)가 카드 ${numberOfDraw}장을 획득하였습니다\n획득 카드 : `);

	// 뽑은 카드 정리 및 공지
	cardYouDraw.forEach((cardType) => {
		const cardYouHave = user.character!.handCards.find((c) => c.type === cardType);
		// 소지중인 카드와 겹친다면 해당 카드 수에 가산
		if (cardYouHave) cardYouHave.count += 1;
		// 없다면 카드를 소지 카드 목록에 추가
		else user.character!.handCards.push({ type: cardType, count: 1 });

		console.log(`[${CardType[cardType]}]`);
	});

	// handCardsCount 업데이트
	// user.character!.handCardsCount += numberOfDraw;
	user.character!.handCardsCount = user.character!.handCards.reduce(
		(sum, card) => sum + card.count,
		0,
	);

	// 수정 정보 갱신
	try {
		updateCharacterFromRoom(roomId, user.id, user.character!);
		//console.log('로그 저장에 성공하였습니다');
		return true;
	} catch (error) {
		console.error(`[만기 적금]로그 저장에 실패하였습니다:[${error}]`);
		return false;
	}
};

export default cardMaturedSavingsEffect;
