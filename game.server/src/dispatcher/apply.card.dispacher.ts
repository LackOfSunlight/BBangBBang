import { getUserFromRoom } from '../utils/room.utils';
import cardAbsorbEffect from '../card/active/card.absorb.effect';
import cardAutoRifleEffect from '../card/weapon/card.auto_rifle.effect';
import cardAutoShieldEffect from '../card/equip/card.auto_shield.effect';
import cardBbangEffect from '../card/active/card.bbang.effect';
import cardBigBbangEffect from '../card/active/card.bigbbang.effect';
import cardBombEffect from '../card/debuff/card.bomb.effect';
import cardCall119Effect from '../card/active/card.call_119.effect';
import cardContainmentUnitEffect from '../card/debuff/card.containment_unit.effect';
import cardDeathMatchEffect from '../card/active/card.death_match.effect';
import cardDesertEagleEffect from '../card/weapon/card.desert_eagle.effect';
import cardFleaMarketEffect from '../card/active/card.flea_market.effect';
import cardGuerrillaEffect from '../card/active/card.guerrilla.effect';
import cardHallucinationEffect from '../card/active/card.hallucination.effect';
import cardHandGunEffect from '../card/weapon/card.hand_gun.effect';
import cardLaserPointerEffect from '../card/equip/card.laser_pointer.effect';
import cardMaturedSavingsEffect from '../card/active/card.matured_savings.effect';
import cardRaderEffect from '../card/equip/card.rader.effect';
import cardSatelliteTargetEffect from '../card/debuff/card.satellite_target.effect';
import cardShieldEffect from '../card/active/card.shield.effect';
import cardSniperGunEffect from '../card/weapon/card.sniper_gun.effect';
import cardStealthSuitEffect from '../card/equip/card.stealth_suit.effect';
import cardVaccineEffect from '../card/active/card.vaccine.effect';
import cardWinLotteryEffect from '../card/active/card.win_lottery.effect';
import { cardManager } from '../managers/card.manager';
import { User } from '../models/user.model';
import { Room } from '../models/room.model';

// 카드 효과 적용 함수
export function applyCardEffect(
	room: Room,
	CardType: number,
	user: User,
	targetUser: User,
): boolean {

	// 유효성 검증 (119 카드 예외 처리)
	if (!user || !user.character) return false;

	if(!CardType) return false;
	cardManager.removeCard(user, room, CardType);
	// 소지한 카드 제거 후 효과 적용
	switch (CardType) {
		case 1: //'BBANG':
			return cardBbangEffect(room, user, targetUser);
		case 2: //'BIGBBANG':
			return cardBigBbangEffect(room, user, targetUser);
		case 3: //'SHIELD':
			return cardShieldEffect(room, user, targetUser);
		case 4: // 'VACCINE':
			return cardVaccineEffect(room, user);
		case 5: // 'CALL_119':
			return cardCall119Effect(room, user, targetUser);
		case 6: // 'DEATH_MATCH':
			return cardDeathMatchEffect(room, user, targetUser);
		case 7: // 'GUIRRILLA':
			return cardGuerrillaEffect(room, user, targetUser);
		case 8: // 'ABSORB':
			return cardAbsorbEffect(room, user, targetUser);
		case 9: // 'HALLUCINATION':
			return cardHallucinationEffect(room, user, targetUser);
		case 10: // 'FLEA_MARKET':
			return cardFleaMarketEffect(room, user, targetUser);
		case 11: // 'MATURED_SAVINGS':
			return cardMaturedSavingsEffect(room, user);
		case 12: // 'WIN_LOTTERY':
			return cardWinLotteryEffect(room, user);

		// 무기 카드
		case 13: // 'SNIPER_GUN':
			return cardSniperGunEffect(room, user);
		case 14: // 'HAND_GUN':
			return cardHandGunEffect(room, user);
		case 15: // 'DESERT_EAGLE':
			return cardDesertEagleEffect(room, user);
		case 16: // 'AUTO_RIFLE':
			return cardAutoRifleEffect(room, user);

		// 장비 카드
		case 17: // 'LASER_POINTER':
			return cardLaserPointerEffect(room, user);
		case 18: // 'RADER':
			return cardRaderEffect(room, user);
		case 19: // 'AUTO_SHIELD':
			return cardAutoShieldEffect(room, user);
		case 20: // 'STEATLH_SUIT':
			return cardStealthSuitEffect(room, user);

		// 디버프 카드
		case 21: // 'CONTAINMENT_UNIT':
			return cardContainmentUnitEffect(room, user, targetUser);
		case 22: // 'SATELLITE_TARGET':
			return cardSatelliteTargetEffect(room, user, targetUser);
		case 23: // 'BOMB':
			return cardBombEffect(room, user, targetUser);
		default:
			console.log('Unknown card type');
			return false;
	}
}
