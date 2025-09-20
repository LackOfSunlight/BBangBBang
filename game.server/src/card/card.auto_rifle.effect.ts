// cardType = 16

import { CardType } from '../generated/common/enums';
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/room.utils';
import { repeatDeck } from '../managers/card.manager';

const cardAutoRifleEffect = (roomId: number, userId: string): boolean => {
	// 정보값 가져오기
	const user = getUserFromRoom(roomId, userId);
	// 유효성 검증
	if (!user || !user.character || !user.character.stateInfo) return false;

	// 여러 검증을 했다면 카드 제거 및 검증 로직 실행
	const haveCard = user.character.handCards.find(c => c.type === CardType.AUTO_RIFLE);
	if (!haveCard) {
		console.warn('[CardType:AUTO_RIFLE] 해당 카드를 소유하고 있지 않습니다')
		return false;
	}
	haveCard.count -= 1;
	if ( haveCard.count <=0 ){
		const lastCardIndex = user.character.handCards.findIndex(c => c.type === CardType.AUTO_RIFLE);
		user.character.handCards.splice(lastCardIndex, 1);
	}
	repeatDeck(roomId, [CardType.AUTO_RIFLE]);

	
	user.character.weapon = CardType.AUTO_RIFLE; // 16;AUTO_RIFLE 장착
	

	// 수정 정보 갱신
	try {
		updateCharacterFromRoom(roomId, userId, user.character);
		return true;
		//console.log('로그 저장에 성공하였습니다');
	} catch (error) {
		console.error(`로그 저장에 실패하였습니다:[${error}]`);
		return false;
	}
};

export default cardAutoRifleEffect;
