import { CharacterType } from '../generated/common/enums';
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util';

// 캐릭터 타입별 최대 체력 정의
const getMaxHp = (characterType: CharacterType): number => {
	switch (characterType) {
		case CharacterType.RED:
		case CharacterType.SHARK:
		case CharacterType.MALANG:
		case CharacterType.FROGGY:
		case CharacterType.PINK:
		case CharacterType.SWIM_GLASSES:
		case CharacterType.MASK:
			return 4;
		case CharacterType.DINOSAUR:
		case CharacterType.PINK_SLIME:
			return 3;
		default:
			return 4; // 기본값
	}
};

const cardVaccineEffect = async (roomId: number, userId: string) => {
	const user = await getUserFromRoom(roomId, userId);

	// 유효성 검증
	if (!user) return;

	const maxHp = getMaxHp(user.character!.characterType);
	if (user.character!.hp >= maxHp) {
		console.log(`체력이 최대치(${maxHp})에 도달하여 더이상 회복 할 수 없습니다.`);
		return;
	}

	const previousHp = user.character!.hp;
	user.character!.hp = Math.min(user.character!.hp + 1, maxHp);

	try {
		await updateCharacterFromRoom(roomId, user.id, user.character!);
		console.log(
			`[백신 사용] ${user.nickname}의 체력이 ${previousHp} → ${user.character!.hp}로 회복되었습니다. (최대: ${maxHp})`,
		);
	} catch (error) {
		console.error(`[백신] Redis 업데이트 실패:`, error);
	}
};
export default cardVaccineEffect;
