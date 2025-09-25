// cardType = 5
import { CharacterType, CardType } from '../../generated/common/enums';
import { CharacterData } from '../../generated/common/types';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

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

const cardCall119Effect = (room: Room, user: User, targetUser: User): boolean => {
	// 유효성 검증
	if (!user || !user.character || !room) return false;

	if (targetUser.id !== '0') {
		const maxHp = getMaxHp(user.character.characterType);
		if (user.character.hp >= maxHp) {
			return false;
		}

		// 자신의 체력 회복
		healCharacter(user, user.character);
		return true;
	} else {
		const isAllFullHp = room.users.every(
			(u) => u.character && u.character.hp >= getMaxHp(u.character.characterType),
		);
		if (isAllFullHp) return false;

		// 나머지 플레이어들의 체력 회복
		// 방의 모든 사용자 정보를 가져와서 자신을 제외한 나머지 플레이어들을 회복
		for (const roomUser of room.users) {
			if (roomUser.id !== user.id && roomUser.character) {
				healCharacter(roomUser, roomUser.character);
			}
		}

		return true;
	}
};

// 체력 회복 로직을 별도 함수로 분리
const healCharacter = (targetUser: { id: string; nickname: string }, character: CharacterData) => {
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

	console.log(
		`[119 호출] ${targetUser.nickname}의 체력이 ${previousHp} → ${character.hp}로 회복되었습니다. (최대: ${maxHp})`,
	);
};

export default cardCall119Effect;
