import { getUserFromRoom, updateCharacterFromRoom } from './room.utils';

import cardAbsorbEffect from '../card/card.absorb.effect';
import cardAutoRifleEffect from '../card/card.auto_rifle.effect';
import cardAutoShieldEffect from '../card/card.auto_shield.effect';
import cardBbangEffect from '../card/card.bbang.effect';
import cardBigBbangEffect from '../card/card.bigbbang.effect';
import cardBombEffect from '../card/card.bomb.effect';
import cardCall119Effect from '../card/card.call_119.effect';
import cardContainmentUnitEffect from '../card/card.containment_unit.effect';
import cardDeathMatchEffect from '../card/card.death_match.effect';
import cardDesertEagleEffect from '../card/card.desert_eagle.effect';
import cardFleaMarketEffect from '../card/card.flea_market.effect';
import cardGuerrillaEffect from '../card/card.guerrilla.effect';
import cardHallucinationEffect from '../card/card.hallucination.effect';
import cardHandGunEffect from '../card/card.hand_gun.effect';
import cardLaserPointerEffect from '../card/card.laser_pointer.effect';
import cardMaturedSavingsEffect from '../card/card.matured_savings.effect';
import cardRaderEffect from '../card/card.rader.effect';
import cardSatelliteTargetEffect from '../card/card.satellite_target.effect';
import cardShieldEffect from '../card/card.shield.effect';
import cardSniperGunEffect from '../card/card.sniper_gun.effect';
import cardStealthSuitEffect from '../card/card.stealth_suit.effect';
import cardVaccineEffect from '../card/card.vaccine.effect';
import cardWinLotteryEffect from '../card/card.win_lottery.effect';
import { repeatDeck } from '../managers/card.manager';

// 카드 효과 적용 함수
export async function applyCardEffect(
	roomId: number,
	CardType: number,
	userId: string,
	targetUserId: string,
): Promise<boolean> {
	const user = getUserFromRoom(roomId, userId);

	// 유효성 검증 (119 카드 예외 처리)
	if (!user || !user.character) return false;

	const usedCard = user.character.handCards.find((c) => c.type === CardType);
	if (usedCard != undefined) {
		usedCard.count -= 1;
		repeatDeck(roomId, [CardType]);

		if (usedCard.count <= 0) {
			user.character.handCards = user.character.handCards.filter((c) => c.count > 0);
			user.character.handCardsCount = user.character.handCards.reduce(
				(sum, card) => sum + card.count,
				0,
			);
		}

		updateCharacterFromRoom(roomId, user.id, user.character);
	} else {
		console.log('해당 카드를 소유하고 있지 않습니다.');
	}

	// 소지한 카드 제거 후 효과 적용
	switch (CardType) {
		case 1: //'BBANG':
			return cardBbangEffect(roomId, userId, targetUserId);
		case 2: //'BIGBBANG':
			return cardBigBbangEffect(roomId, userId, targetUserId);
		case 3: //'SHIELD':
			return cardShieldEffect(roomId, userId, targetUserId);
		case 4: // 'VACCINE':
			return cardVaccineEffect(roomId, userId);
		case 5: // 'CALL_119':
			return cardCall119Effect(roomId, userId, targetUserId);
		case 6: // 'DEATH_MATCH':
			return cardDeathMatchEffect(roomId, userId, targetUserId);
		case 7: // 'GUIRRILLA':
			return cardGuerrillaEffect(roomId, userId, targetUserId);
		case 8: // 'ABSORB':
			return cardAbsorbEffect(roomId, userId, targetUserId);
		case 9: // 'HALLUCINATION':
			return cardHallucinationEffect(roomId, userId, targetUserId);
		case 10: // 'FLEA_MARKET':
			return cardFleaMarketEffect(roomId, userId, targetUserId);
		case 11: // 'MATURED_SAVINGS':
			return cardMaturedSavingsEffect(roomId, userId);
		case 12: // 'WIN_LOTTERY':
			return cardWinLotteryEffect(roomId, userId);

		// 무기 카드
		case 13: // 'SNIPER_GUN':
			return cardSniperGunEffect(roomId, userId);
		case 14: // 'HAND_GUN':
			return cardHandGunEffect(roomId, userId);
		case 15: // 'DESERT_EAGLE':
			return cardDesertEagleEffect(roomId, userId);
		case 16: // 'AUTO_RIFLE':
			return cardAutoRifleEffect(roomId, userId);

		// 장비 카드
		case 17: // 'LASER_POINTER':
			return cardLaserPointerEffect(roomId, userId);
		case 18: // 'RADER':
			return cardRaderEffect(roomId, userId);
		case 19: // 'AUTO_SHIELD':
			return cardAutoShieldEffect(roomId, userId);
		case 20: // 'STEATLH_SUIT':
			return cardStealthSuitEffect(roomId, userId);

		// 디버프 카드
		case 21: // 'CONTAINMENT_UNIT':
			return cardContainmentUnitEffect(roomId, userId, targetUserId);
		case 22: // 'SATELLITE_TARGET':
			return cardSatelliteTargetEffect(roomId, userId, targetUserId);
		case 23: // 'BOMB':
			return cardBombEffect(roomId, userId, targetUserId);
		default:
			console.log('Unknown card type');
			return false;
	}
}
