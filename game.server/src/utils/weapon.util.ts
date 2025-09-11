import { CharacterData } from '../generated/common/types';
import { CardType } from '../generated/common/enums';

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

/**
 * 장착한 무기에 따른 '뱅' 카드 사용 횟수 제한을 반환합니다.
 * @param character 유저의 캐릭터 정보
 * @returns 하루에 사용 가능한 '뱅' 카드 횟수
 */
export const bbangLimit = (character: CharacterData): number => {
	const weaponType = character.weapon;

	switch (weaponType) {
		case CardType.AUTO_RIFLE: // 자동소총: 뱅 무제한
			return 99; // Infinity 대신 99로 설정
		case CardType.HAND_GUN: // 핸드건: 뱅 2회 가능
			return 2;
		default:
			return 1; // 기본 1회
	}
};

/**
 * 장착한 무기가 거리 제한을 무시하는지 확인합니다.
 * @param character 유저의 캐릭터 정보
 * @returns 거리 제한 무시 여부
 */
export const InfiniteRange = (character: CharacterData): boolean => {
	const weaponType = character.weapon;

	switch (weaponType) {
		case CardType.SNIPER_GUN: // 저격총: 거리 제한 없음
			return true;
		default:
			return false;
	}
};
