// cardType = 16

import { CardType } from '../../generated/common/enums';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { cardManager } from '../../managers/card.manager';

const cardAutoRifleEffect = (roomId: number, userId: string): boolean => {
	// 정보값 가져오기
	const user = getUserFromRoom(roomId, userId);
	const room = getRoom(roomId);
	// 유효성 검증
	if (!user || !user.character || !user.character.stateInfo) {
		console.error('[AUTO_RIFLE]사용자 정보가 존재하지 않습니다');
		return false;
	}
	if (!room) {
		console.error('[AUTO_RIFLE]방이 존재하지 않습니다.');
		return false;
	}

	if (user.character.weapon !== CardType.AUTO_RIFLE) {
		user.character.weapon = CardType.AUTO_RIFLE;
		cardManager.removeCard(user, room, CardType.AUTO_RIFLE);
	} else {
		return false;
	}

	// 카드 제거

	// 16;AUTO_RIFLE 장착

	// 수정 정보 갱신
	try {
		updateCharacterFromRoom(roomId, userId, user.character);
		return true;
		//console.log('[AUTO_RIFLE]로그 저장에 성공하였습니다');
	} catch (error) {
		console.error(`[AUTO_RIFLE]로그 저장에 실패하였습니다:[${error}]`);
		return false;
	}
};

export default cardAutoRifleEffect;
