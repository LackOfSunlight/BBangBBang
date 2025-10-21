import { CharacterData } from '@core/generated/common/types';
import { CardType } from '@core/generated/common/enums';

/**
 * 무기 효과에 따른 최종 데미지를 계산합니다. (데미지 변경 무기용)
 * @param damage 기본 데미지
 * @param character 공격하는 유저의 캐릭터 정보
 * @returns 무기 효과가 적용된 최종 데미지
 */
export const weaponDamageEffect = (damage: number, character: CharacterData): number => {
	const weaponType = character.weapon;

	switch (weaponType) {
		case CardType.DESERT_EAGLE: // 데저트 이글: 데미지 2배
			return damage * 2;

		default:
			return damage;
	}
};
