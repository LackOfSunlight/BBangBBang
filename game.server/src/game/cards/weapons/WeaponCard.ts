import { CardType } from '@core/generated/common/enums';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import { Card } from '@game/models/card.model';
import { CardCategory } from '@game/enums/card.category';

/**
 * WeaponCard 추상 클래스
 * 모든 무기 카드의 기본 구조를 정의합니다.
 */
export abstract class WeaponCard extends Card {
	protected damage: number;
	protected range?: number;
	protected specialEffects?: string[];

	constructor(cardType: CardType, cardCategory: CardCategory, damage: number, range?: number, specialEffects?: string[]) {
		super(cardType, cardCategory);
		this.damage = damage;
		this.range = range;
		this.specialEffects = specialEffects;
	}

	/**
	 * 무기 카드 사용 메서드
	 * 기본적으로 데미지를 주는 로직을 포함합니다.
	 */
	public useCard(room: Room, user: User, target?: User): boolean {
		if (!target) {
			console.log(`[${this.type}] 대상이 지정되지 않았습니다.`);
			return false;
		}

		if (!this.canUse(user, room, target)) {
			return false;
		}

		// 무기 사용 시 데미지 적용
		this.applyDamage(user, room, target);
		
		// 특수 효과 적용
		this.applySpecialEffects(user, room, target);

		return true;
	}

	/**
	 * 데미지 적용
	 */
	protected applyDamage(user: User, room: Room, target: User): void {
		if (!target.character) return;

		// 데미지 서비스 호출
		const takeDamageService = require('../../../../services/take.damage.service').default;
		takeDamageService(room, target, this.damage, user);
	}

	/**
	 * 특수 효과 적용
	 * 각 무기별로 오버라이드할 수 있습니다.
	 */
	protected applySpecialEffects(user: User, room: Room, target: User): void {
		// 기본적으로는 특수 효과가 없음
		// 각 무기별로 오버라이드하여 구현
	}

	/**
	 * 무기 사용 가능 여부 확인
	 */
	public canUse(user: User, room: Room, target?: User): boolean {
		if (!target || !user.character || !target.character) {
			return false;
		}

		// 같은 플레이어를 공격할 수 없음
		if (user.id === target.id) {
			console.log(`[${this.type}] 자기 자신을 공격할 수 없습니다.`);
			return false;
		}

		return true;
	}

	/**
	 * 무기 정보 반환
	 */
	public getWeaponInfo(): { damage: number; range?: number; specialEffects?: string[] } {
		return {
			damage: this.damage,
			range: this.range,
			specialEffects: this.specialEffects
		};
	}
}

export default WeaponCard;
