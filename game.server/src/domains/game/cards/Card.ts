import { CardType } from '../../../generated/common/enums';
import { Room } from '../../../models/room.model';
import { User } from '../../../models/user.model';

/**
 * Card 추상 클래스
 * 모든 카드의 기본 구조를 정의합니다.
 */
export abstract class Card {
	protected cardType: CardType;

	constructor(cardType: CardType) {
		this.cardType = cardType;
	}

	/**
	 * 카드 사용 메서드
	 * 각 카드 타입별로 구체적인 구현이 필요합니다.
	 */
	public abstract useCard(user: User, room: Room, target?: User): boolean;

	/**
	 * 카드 타입 반환
	 */
	public getCardType(): CardType {
		return this.cardType;
	}

	/**
	 * 카드 사용 가능 여부 확인
	 * 기본적으로는 true를 반환하지만, 특수한 조건이 있는 카드는 오버라이드할 수 있습니다.
	 */
	public canUse(user: User, room: Room, target?: User): boolean {
		return true;
	}

	/**
	 * 카드 설명 반환
	 */
	public abstract getDescription(): string;
}

export default Card;
