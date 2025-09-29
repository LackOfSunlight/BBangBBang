import { CharacterType } from '../generated/common/enums';

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

export default getMaxHp;
