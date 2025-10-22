import { CharacterType } from '@core/generated/common/enums';

// 캐릭터 타입별 최대 체력 정의
const getMaxHp = (characterType: CharacterType): number => {
	return 4;
};

// 캐릭터 타입별 최대 빵야 사용 횟수 정의
export const getMaxBbangCount = (characterType: CharacterType): number => {
	switch (characterType) {
		case CharacterType.RED:
			return 999; // 무제한
		case CharacterType.MALANG:
			return 1;
		default:
			return 1; // 기본값
	}
};

export default getMaxHp;
