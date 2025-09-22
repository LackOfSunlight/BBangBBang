// cardType = 14
import { getRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { CardType } from '../../generated/common/enums';
import { removeCard } from '../../managers/card.manager.js';

const cardHandGunEffect = (roomId: number, userId: string): boolean => {
	try {
		const room = getRoom(roomId);

		// 유저 찾기
		const user = room.users.find((u) => u.id === userId);
		if (!user || !user.character) return false;

		// 카드 제거
		removeCard(user, room, CardType.HAND_GUN);

		// 핸드건 카드 효과: 하루에 사용할 수 있는 빵야!가 두 개로 증가
		// 무기 카드이므로 자신에게만 적용 (targetUserId 무시)

		user.character.weapon = CardType.HAND_GUN;

		// 방의 유저 정보 업데이트
		updateCharacterFromRoom(roomId, user.id, user.character);
		return true;
	} catch (error) {
		// 에러 로그 제거
		return false;
	}
};

export default cardHandGunEffect;