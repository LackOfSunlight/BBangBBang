// cardType = 17
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/room.utils';
import { CardType } from '../generated/common/enums';
import { repeatDeck } from '../managers/card.manager';

const cardLaserPointerEffect = (roomId: number, userId: string) : boolean => {
	const user = getUserFromRoom(roomId, userId);
	// 유효성 검증
	if (!user || !user.character) return false;

	// 여러 검증을 했다면 카드 제거 및 검증 로직 실행
	const haveCard = user.character.handCards.find(c => c.type === CardType.LASER_POINTER);
	if (!haveCard) {
		console.warn('[CardType:LASER_POINTER] 해당 카드를 소유하고 있지 않습니다')
		return false;
	}
	haveCard.count -= 1;
	if ( haveCard.count <=0 ){
		const lastCardIndex = user.character.handCards.findIndex(c => c.type === CardType.LASER_POINTER);
		user.character.handCards.splice(lastCardIndex, 1);
	}

	// 중복 착용 중일 경우
	if (!user.character.equips.includes(CardType.LASER_POINTER)) {
		user.character.equips.push(CardType.LASER_POINTER);
		// 처리 후 덱으로 회수
		repeatDeck(roomId, [CardType.LASER_POINTER]);
	} else {
		return false;
	}

	// 수정 정보 갱신
	try{
		updateCharacterFromRoom(roomId, userId, user.character);
		return true;
		//console.log('로그 저장에 성공하였습니다');
	} catch (error) {
		console.error(`로그 저장에 실패하였습니다:[${error}]`);
		return false;
	}
};

export default cardLaserPointerEffect;
