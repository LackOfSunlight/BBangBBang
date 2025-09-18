// cardType = 20
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';
import { CardType } from '../generated/common/enums.js';

const cardStealthSuitEffect = async (roomId: number, userId: string): Promise<boolean> => {
	const user = await getUserFromRoom(roomId, userId);

	// 유효성 검증
	if (!user || !user.character) return false;

	// 스텔스 장치 카드 효과: 장비 착용
	// 장비 카드이므로 자신에게만 적용 (targetUserId 무시)

	// 기존 스텔스 장치가 있는지 확인 (중복 착용 방지)
	const existingStealthIndex = user.character.equips.findIndex(
		(equipId) => equipId === CardType.STEALTH_SUIT,
	);

	if (existingStealthIndex >= 0) {
		// 이미 스텔스 장치를 착용 중인 경우 - 교체 (기존 장비 제거 후 새로 추가)
		user.character.equips.splice(existingStealthIndex, 1);
	}

	// 스텔스 장치 장착 (장비 ID: CardType.STEALTH_SUIT)
	user.character.equips.push(CardType.STEALTH_SUIT);

	// Redis에 업데이트된 캐릭터 정보 저장
	try {
		await updateCharacterFromRoom(roomId, user.id, user.character);
		console.log(`[스텔스 장치] ${user.nickname}이 스텔스 장치를 장착했습니다.`);
		return true;
	} catch (error) {
		console.error(`[스텔스 장치] Redis 업데이트 실패:`, error);
		return false;
	}
};

export default cardStealthSuitEffect;
