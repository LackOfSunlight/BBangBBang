// cardType = 16

import { CardType } from '../generated/common/enums.js';
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/room.utils.js';

const cardAutoRifleEffect = (roomId: number, userId: string): boolean => {
	// 정보값 가져오기
	const user = getUserFromRoom(roomId, userId);
	// 유효성 검증
	if (!user || !user.character || !user.character.stateInfo) return false;

	// 소지 카드에서의 제거는 호출함수에서 처리
	if (!user.character.equips.includes(CardType.AUTO_RIFLE)) {
		user.character.weapon = CardType.AUTO_RIFLE; // 16;AUTO_RIFLE 장착
	} else {
		return false;
	}

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
