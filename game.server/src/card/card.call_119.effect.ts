// cardType = 5

import { getRoom, updateCharacterFromRoom, getUserFromRoom } from '../utils/room.utils.js';
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



const cardCall119Effect = (
	roomId: number,
	userId: string,
	targetUserId: string,
): boolean => {
	const user = getUserFromRoom(roomId, userId);

	// 유효성 검증
	if (!user || !user.character) return false;

		// 유효성 검증
		if (!user || !user.character) return false;


	if (targetUserId != '0') {
		// 자신의 체력 회복
		healCharacter(roomId, user, user.character);
		return true;
	} else {
		// 나머지 플레이어들의 체력 회복
		// 방의 모든 사용자 정보를 가져와서 자신을 제외한 나머지 플레이어들을 회복
		const room = getRoom(roomId);
		if (!room) return false;

		if (targetUserId != '0') {
			// 자신의 체력 회복
			healCharacter(roomId, user, user.character);
			return true;
		} else {
			// 나머지 플레이어들의 체력 회복
			// 방의 모든 사용자 정보를 가져와서 자신을 제외한 나머지 플레이어들을 회복
			const room = getRoom(roomId);
			if (!room) return false;

			for (const roomUser of room.users) {
				if (roomUser.id !== userId && roomUser.character) {
					healCharacter(roomId, roomUser, roomUser.character);
				}
			}

			return true;
		}
	}
};

// 체력 회복 로직을 별도 함수로 분리
const healCharacter = (
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

	// 방의 유저 정보 업데이트
	try {
		updateCharacterFromRoom(roomId, targetUser.id, character);
		console.log(
			`[119 호출] ${targetUser.nickname}의 체력이 ${previousHp} → ${character.hp}로 회복되었습니다. (최대: ${maxHp})`,
		);
	} catch (error) {
		// 에러가 발생해도 함수는 정상적으로 완료됨
	}
};

export default cardCall119Effect;