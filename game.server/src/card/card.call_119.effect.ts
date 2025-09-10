// cardType = 5
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';
import { CharacterType } from '../generated/common/enums.js';

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

const cardCall119Effect = async (roomId: number, userId: string, targetUserId: string) => {
	const user = await getUserFromRoom(roomId, userId);
	const target = await getUserFromRoom(roomId, targetUserId);

	// 유효성 검증
	if (!user || !user.character) return;

	// 119 호출 카드 효과: 체력 1 회복
	// targetUserId가 있으면 해당 플레이어, 없으면 자신의 체력 회복
	const targetUser = targetUserId && target ? target : user;

	// 대상 유저의 캐릭터가 존재하는지 확인
	if (!targetUser.character) {
		console.warn(`[119 호출] 대상 유저 ${targetUser.nickname}의 캐릭터 정보가 없습니다.`);
		return;
	}

	// 최대 체력 확인
	const maxHp = getMaxHp(targetUser.character.characterType);

	// 체력이 이미 최대치인지 확인
	if (targetUser.character.hp >= maxHp) {
		console.log(`[119 호출] ${targetUser.nickname}의 체력이 이미 최대치(${maxHp})입니다.`);
		return; // void 반환
	}

	// 체력 1 회복 (최대 체력 제한 적용)
	const previousHp = targetUser.character.hp;
	targetUser.character.hp = Math.min(targetUser.character.hp + 1, maxHp);

	// Redis에 업데이트된 캐릭터 정보 저장 (에러 처리 추가)
	try {
		await updateCharacterFromRoom(roomId, targetUser.id, targetUser.character);
		console.log(
			`[119 호출] ${targetUser.nickname}의 체력이 ${previousHp} → ${targetUser.character.hp}로 회복되었습니다. (최대: ${maxHp})`,
		);
	} catch (error) {
		console.error(`[119 호출] Redis 업데이트 실패:`, error);
		// 에러가 발생해도 함수는 정상적으로 완료됨
	}
};

export default cardCall119Effect;
