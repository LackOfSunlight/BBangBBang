import { CharacterData } from '../generated/common/types';

/**
 * 무기 효과에 따른 최종 데미지를 계산합니다.
 * @param damage 기본 데미지
 * @param character 공격하는 유저의 캐릭터 정보
 * @returns 무기 효과가 적용된 최종 데미지
 */
export const applyWeaponDamageEffect = (damage: number, character: CharacterData): number => {
	const weaponType = character.weapon;

	switch (weaponType) {
		case 15: // 데저트 이글: 데미지 2배
			return damage * 2;
		default:
			return damage;
	}
};

/**                                                                                                                                                                          │
* 장착한 무기에 따른 '뱅' 카드 사용 횟수 제한을 반환합니다.                                                                                                                 │
* @param character 유저의 캐릭터 정보                                                                                                                                       │
* @returns 하루에 사용 가능한 '뱅' 카드 횟수                                                                                                                                │
*/     
export const getBbangLimit = (character: CharacterData): number => {
	const weaponType = character.weapon;

	switch (weaponType) {
		case 16: //자동소총 : 뱅 무제한
		return Infinity;
		case 14: //핸드건 : 뱅 2회
		return 2;
		default: //무기 없음, 데저트 이글 : 뱅 1회
		return 1;
	}
};

export const infiniteRange = (character: CharacterData): boolean => {
	const weaponType = character.weapon;

	switch (weaponType) {
		case 13: //저격총 : 사거리 무제한
		return true;
		default:
		return false;
	}
};

