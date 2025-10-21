import { CardType } from '@core/generated/common/enums';
import { CardCategory } from '@game/enums/card.category';
import { Room } from './room.model';
import { User } from './user.model';
import { ICard } from '@common/types/card';

// 모든 카드 클래스 import
import { BBangCard } from '../cards/card.bbang';
import { BigBBangCard } from '../cards/card.bibbang';
import { ShieldCard } from '../cards/card.shield';
import { VaccineCard } from '../cards/card.vaccine';
import { Call119Card } from '../cards/card.call.119';
import { DeathMatchCard } from '../cards/card.death.match';
import { GuerrillaCard } from '../cards/card.guerrilla';
import { AbsorbCard } from '../cards/card.absorb';
import { HallucinationCard } from '../cards/card.hallucinaion';
import { FleaMarketCard } from '../cards/card.flea.market';
import { MaturedSavingsCard } from '../cards/card.matured.savings';
import { WinLotteryCard } from '../cards/card.win.lottery';
import { SniperGunCard } from '../cards/card.sniper.gun';
import { HandGunCard } from '../cards/card.hand.gun';
import { DesertEagleCard } from '../cards/card.desert.eagle';
import { AutoRifleCard } from '../cards/card.auto.rifle';
import { LaserPointerCard } from '../cards/card.laser.pointer';
import { RadarCard } from '../cards/card.radar';
import { AutoShieldCard } from '../cards/card.auto.shield';
import { StealthSuitCard } from '../cards/card.stealth,suit';
import { ContainmentUnitCard } from '../cards/card.containment.unit';
import { SatelliteTargetCard } from '../cards/card.satellite.target';
import { BombCard } from '../cards/card.bomb';

/**
 * Card 추상 모델 클래스
 * 모든 카드의 기본 구조와 팩토리 메서드를 제공합니다.
 * 
 * 기존 ICard 인터페이스와 완전히 호환되도록 설계되었습니다.
 */
export abstract class Card implements ICard {
	// ICard 인터페이스 필드 (기존 호환성)
	public readonly type: CardType;
	public readonly cardCategory: CardCategory;
	
	constructor(cardType: CardType, cardCategory: CardCategory) {
		this.type = cardType;
		this.cardCategory = cardCategory;
	}
	
	/**
	 * 카드 사용 메서드
	 * 각 카드 타입별로 구체적인 구현이 필요합니다.
	 */
	public abstract useCard(room: Room, user: User, target?: User): boolean;
	
	/**
	 * 카드 설명 반환
	 */
	public abstract getDescription(): string;
	
	/**
	 * 카드 사용 가능 여부 확인
	 * 기본적으로는 true를 반환하지만, 특수한 조건이 있는 카드는 오버라이드할 수 있습니다.
	 */
	public canUse(user: User, room: Room, target?: User): boolean {
		return true;
	}
	
	/**
	 * 카드 타입 반환 (기존 호환성)
	 */
	public getCardType(): CardType {
		return this.type;
	}
	
	/**
	 * 카드 카테고리 반환
	 */
	public getCardCategory(): CardCategory {
		return this.cardCategory;
	}
	
	// ===== 정적 팩토리 메서드들 (기존 CardFactory 통합) =====
	
	/**
	 * 카드 인스턴스 캐시 (싱글톤 패턴)
	 */
	private static cardInstances: Map<CardType, ICard> = new Map();
	
	/**
	 * 카드 타입에 따른 카드 인스턴스 생성
	 * 기존 카드 로직은 전혀 건드리지 않고, 팩토리 메서드만 추가
	 */
	public static createCard(cardType: CardType): ICard {
		// 이미 생성된 인스턴스가 있으면 재사용 (싱글톤 패턴)
		if (this.cardInstances.has(cardType)) {
			return this.cardInstances.get(cardType)!;
		}
		
		let card: ICard;
		
		switch (cardType) {
			// 공격 카드
			case CardType.BBANG:
				card = new BBangCard();
				break;
			case CardType.BIG_BBANG:
				card = new BigBBangCard();
				break;
			case CardType.SHIELD:
				card = new ShieldCard();
				break;
				
			// 회복/버프 카드
			case CardType.VACCINE:
				card = new VaccineCard();
				break;
			case CardType.CALL_119:
				card = new Call119Card();
				break;
				
			// 특수 효과 카드
			case CardType.DEATH_MATCH:
				card = new DeathMatchCard();
				break;
			case CardType.GUERRILLA:
				card = new GuerrillaCard();
				break;
			case CardType.ABSORB:
				card = new AbsorbCard();
				break;
			case CardType.HALLUCINATION:
				card = new HallucinationCard();
				break;
				
			// 드로우 카드
			case CardType.FLEA_MARKET:
				card = new FleaMarketCard();
				break;
			case CardType.MATURED_SAVINGS:
				card = new MaturedSavingsCard();
				break;
			case CardType.WIN_LOTTERY:
				card = new WinLotteryCard();
				break;
				
			// 무기 카드
			case CardType.SNIPER_GUN:
				card = new SniperGunCard();
				break;
			case CardType.HAND_GUN:
				card = new HandGunCard();
				break;
			case CardType.DESERT_EAGLE:
				card = new DesertEagleCard();
				break;
			case CardType.AUTO_RIFLE:
				card = new AutoRifleCard();
				break;
			case CardType.LASER_POINTER:
				card = new LaserPointerCard();
				break;
				
			// 장비 카드
			case CardType.RADAR:
				card = new RadarCard();
				break;
			case CardType.AUTO_SHIELD:
				card = new AutoShieldCard();
				break;
			case CardType.STEALTH_SUIT:
				card = new StealthSuitCard();
				break;
				
			// 디버프 카드
			case CardType.CONTAINMENT_UNIT:
				card = new ContainmentUnitCard();
				break;
			case CardType.SATELLITE_TARGET:
				card = new SatelliteTargetCard();
				break;
			case CardType.BOMB:
				card = new BombCard();
				break;
				
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
			case CardType.BBANG:
			case CardType.BIG_BBANG:
			case CardType.SHIELD:
			case CardType.VACCINE:
			case CardType.CALL_119:
			case CardType.DEATH_MATCH:
			case CardType.GUERRILLA:
			case CardType.ABSORB:
			case CardType.HALLUCINATION:
			case CardType.FLEA_MARKET:
			case CardType.MATURED_SAVINGS:
			case CardType.WIN_LOTTERY:
			case CardType.SNIPER_GUN:
			case CardType.HAND_GUN:
			case CardType.DESERT_EAGLE:
			case CardType.AUTO_RIFLE:
			case CardType.LASER_POINTER:
			case CardType.RADAR:
			case CardType.AUTO_SHIELD:
			case CardType.STEALTH_SUIT:
			case CardType.CONTAINMENT_UNIT:
			case CardType.SATELLITE_TARGET:
			case CardType.BOMB:
				return true;
			default:
				return false;
		}
	}
	
	/**
	 * 지원되는 모든 카드 타입 반환
	 */
	public static getSupportedCardTypes(): CardType[] {
		return [
			CardType.BBANG,
			CardType.BIG_BBANG,
			CardType.SHIELD,
			CardType.VACCINE,
			CardType.CALL_119,
			CardType.DEATH_MATCH,
			CardType.GUERRILLA,
			CardType.ABSORB,
			CardType.HALLUCINATION,
			CardType.FLEA_MARKET,
			CardType.MATURED_SAVINGS,
			CardType.WIN_LOTTERY,
			CardType.SNIPER_GUN,
			CardType.HAND_GUN,
			CardType.DESERT_EAGLE,
			CardType.AUTO_RIFLE,
			CardType.LASER_POINTER,
			CardType.RADAR,
			CardType.AUTO_SHIELD,
			CardType.STEALTH_SUIT,
			CardType.CONTAINMENT_UNIT,
			CardType.SATELLITE_TARGET,
			CardType.BOMB,
		];
	}
	
	/**
	 * 카드 인스턴스 캐시 초기화
	 */
	public static clearCache(): void {
		this.cardInstances.clear();
	}
}

export default Card;
