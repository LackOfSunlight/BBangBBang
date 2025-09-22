import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { CardType } from '../../generated/common/enums';
import { removeCard } from '../../managers/card.manager';

const cardAutoShieldEffect = (roomId: number, userId: string): boolean => {
	try {
		const user = getUserFromRoom(roomId, userId);
		const room = getRoom(roomId);

		// 유효성 검증 1: 유저 및 캐릭터 존재 여부
		if (!user || !user.character) {
			console.warn(`[자동 방패] 유저 또는 캐릭터 정보를 찾을 수 없습니다: ${userId}`);
			return false;
		}

		// 유효성 검증 2: 이미 자동 방패를 장착했는지 확인
		if (user.character.equips.includes(CardType.AUTO_SHIELD)) {
			console.log(`[자동 방패] ${user.nickname}님은 이미 자동 방패를 장착하고 있습니다.`);
			return false;
		}

		if (!user.character.equips.includes(CardType.AUTO_SHIELD)) {
			// 자동 방패 장착
			user.character.equips.push(CardType.AUTO_SHIELD);
			// 조건 만족 시 카드 제거
			removeCard(user, room, CardType.AUTO_SHIELD);
		} else {
			return false;
		}

		// 정보 업데이트
		updateCharacterFromRoom(roomId, userId, user.character);
		console.log(`[자동 방패] ${user.nickname}님이 자동 방패를 장착했습니다.`);
		return true;
	} catch (error) {
		console.error(`[자동 방패] 처리 중 에러 발생:`, error);
		return false;
	}
};

// 피격 시 자동 쉴드의 25% 방어 확률을 계산하는 효과.
export const autoShieldBlock = (): boolean => {
	return Math.random() < 0.25;
};

export default cardAutoShieldEffect;
