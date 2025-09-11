// cardType = 5
import { getUserFromRoom, updateCharacterFromRoom, getRoom } from '../utils/redis.util.js';
import { CharacterType } from '../generated/common/enums.js';
import { CharacterData } from '../generated/common/types.js';

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

	// 유효성 검증
	if (!user || !user.character) return;

	// 119 호출 카드 효과: 자신의 체력을 1 회복하거나, 나머지의 체력을 1 회복
	// targetUserId가 있으면 자신의 체력 회복, 없으면 나머지 플레이어들의 체력 회복

	if (targetUserId) {
		// 자신의 체력 회복
		await healCharacter(roomId, user, user.character);
	} else {
		// 나머지 플레이어들의 체력 회복
		// 방의 모든 사용자 정보를 가져와서 자신을 제외한 나머지 플레이어들을 회복
		const room = await getRoom(roomId);
		if (!room) return;

		for (const roomUser of room.users) {
			if (roomUser.id !== userId && roomUser.character) {
				await healCharacter(roomId, roomUser, roomUser.character);
			}
		}
	}
};

// 체력 회복 로직을 별도 함수로 분리
const healCharacter = async (
	roomId: number,
	targetUser: { id: string; nickname: string },
	character: CharacterData,
) => {
	// 최대 체력 확인
	const maxHp = getMaxHp(character.characterType);

	// 체력이 이미 최대치인지 확인
	if (character.hp >= maxHp) {
		console.log(`[119 호출] ${targetUser.nickname}의 체력이 이미 최대치(${maxHp})입니다.`);
		return;
	}

	// 체력 1 회복 (최대 체력 제한 적용)
	const previousHp = character.hp;
	character.hp = Math.min(character.hp + 1, maxHp);

	// Redis에 업데이트된 캐릭터 정보 저장 (에러 처리 추가)
	try {
		await updateCharacterFromRoom(roomId, targetUser.id, character);
		console.log(
			`[119 호출] ${targetUser.nickname}의 체력이 ${previousHp} → ${character.hp}로 회복되었습니다. (최대: ${maxHp})`,
		);
	} catch (error) {
		console.error(`[119 호출] Redis 업데이트 실패:`, error);
		// 에러가 발생해도 함수는 정상적으로 완료됨
	}
};

export default cardCall119Effect;
