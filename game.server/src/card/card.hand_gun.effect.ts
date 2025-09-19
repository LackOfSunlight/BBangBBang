// cardType = 14
import { getRoom, updateCharacterFromRoom } from '../utils/room.utils.js';
import { CardType } from '../generated/common/enums.js';

const cardHandGunEffect = (roomId: number, userId: string): boolean => {
	try {
		const room = getRoom(roomId);

		// 유저 찾기
		const user = room.users.find((u) => u.id === userId);
		if (!user || !user.character) return false;

		// 핸드건 카드 효과: 하루에 사용할 수 있는 빵야!가 두 개로 증가
		// 무기 카드이므로 자신에게만 적용 (targetUserId 무시)

		user.character.weapon = CardType.HAND_GUN;

		// 방의 유저 정보 업데이트
		updateCharacterFromRoom(roomId, user.id, user.character);
		return true;
	} catch (error) {
		console.error(`[핸드건] 방 또는 유저를 찾을 수 없음:`, error);
		return false;
	}
};

export default cardHandGunEffect;
