import { CardType } from '../../../../generated/common/enums';
import { Room } from '../../../../models/room.model';
import { User } from '../../../../models/user.model';
import { WeaponCard } from './WeaponCard';

/**
 * HandGun 카드 클래스
 * 새로운 OOP 구조로 구현된 권총 카드
 */
export class HandGunCard extends WeaponCard {
	constructor() {
		super(CardType.HAND_GUN, 1); // 데미지 1
	}

	/**
	 * HandGun 카드 사용
	 * 기존 로직을 새로운 구조로 포팅
	 */
	public useCard(user: User, room: Room, target?: User): boolean {
		// 유효성 검증
		if (!user.character) {
			console.log(`[${this.cardType}] 사용자 캐릭터가 없습니다.`);
			return false;
		}

		// 이미 같은 무기를 장착하고 있는지 확인
		if (user.character.weapon === CardType.HAND_GUN) {
			console.log(`[${this.cardType}] 이미 권총을 장착하고 있습니다.`);
			return false;
		}

		// 기존 무기가 있으면 덱으로 반환
		if (user.character.weapon) {
			room.repeatDeck([user.character.weapon]);
		}

		// 새로운 무기 장착
		user.character.weapon = CardType.HAND_GUN;
		user.character.removeHandCard(CardType.HAND_GUN);

		console.log(`[${this.cardType}] ${user.nickname}이(가) 권총을 장착했습니다.`);
		return true;
	}

	/**
	 * HandGun 카드 설명
	 */
	public getDescription(): string {
		return "데미지 1의 기본 권총입니다. 안정적이고 신뢰할 수 있는 무기입니다.";
	}

	/**
	 * HandGun은 장착 카드이므로 데미지 적용을 오버라이드
	 */
	protected applyDamage(user: User, room: Room, target: User): void {
		// HandGun은 장착 카드이므로 직접 데미지를 주지 않음
		// 실제 공격 시에는 다른 메커니즘을 통해 데미지가 적용됨
	}
}

export default HandGunCard;
