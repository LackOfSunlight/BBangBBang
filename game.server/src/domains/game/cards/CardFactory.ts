import { CardType } from '../../../generated/common/enums';
import { Card } from './Card';
import { HandGunCard } from './weapons/HandGunCard';

/**
 * CardFactory 클래스
 * 카드 타입에 따라 적절한 카드 인스턴스를 생성합니다.
 */
export class CardFactory {
	private static cardInstances: Map<CardType, Card> = new Map();

	/**
	 * 카드 타입에 따른 카드 인스턴스 생성
	 */
	public static createCard(cardType: CardType): Card {
		// 이미 생성된 인스턴스가 있으면 재사용
		if (this.cardInstances.has(cardType)) {
			return this.cardInstances.get(cardType)!;
		}

		let card: Card;

		switch (cardType) {
			case CardType.HAND_GUN:
				card = new HandGunCard();
				break;
			
			// TODO: 다른 카드 타입들 추가
			// case CardType.SHIELD:
			//     card = new ShieldCard();
			//     break;
			// case CardType.BOMB:
			//     card = new BombCard();
			//     break;
			
			default:
				throw new Error(`지원하지 않는 카드 타입입니다: ${cardType}`);
		}

		// 인스턴스 캐시에 저장
		this.cardInstances.set(cardType, card);
		return card;
	}

	/**
	 * 특정 카드 타입이 지원되는지 확인
	 */
	public static isSupported(cardType: CardType): boolean {
		switch (cardType) {
			case CardType.HAND_GUN:
				return true;
			
			// TODO: 다른 카드 타입들 추가
			default:
				return false;
		}
	}

	/**
	 * 지원되는 모든 카드 타입 반환
	 */
	public static getSupportedCardTypes(): CardType[] {
		return [
			CardType.HAND_GUN,
			// TODO: 다른 카드 타입들 추가
		];
	}

	/**
	 * 카드 인스턴스 캐시 초기화
	 */
	public static clearCache(): void {
		this.cardInstances.clear();
	}
}

export default CardFactory;
