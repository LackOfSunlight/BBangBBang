import { getUserFromRoom } from "./redis.util.js";

import cardAbsorbEffect from "../card/card.absorb.effect.js";
import cardAutoRifleEffect from "../card/card.auto_rifle.effect.js";
import cardAutoShieldEffect from "../card/card.auto_shield.effect.js";
import cardBbangEffect from "../card/card.bbang.effect.js";
import cardBigBbangEffect from "../card/card.bigbbang.effect.js";
import cardBombEffect from "../card/card.bomb.effect.js";
import cardCall119Effect from "../card/card.call_119.effect.js";
import cardContainmentUnitEffect from "../card/card.containment_unit.effect.js";
import cardDeathMatchEffect from "../card/card.death_match.effect.js";
import cardDesertEagleEffect from "../card/card.desert_eagle.effect.js";
import cardFleaMarketEffect from "../card/card.flea_market.effect.js";
import cardGuerrillaEffect from "../card/card.guerrilla.effect.js";
import cardHallucinationEffect from "../card/card.hallucination.effect.js";
import cardHandGunEffect from "../card/card.hand_gun.effect.js";
import cardLaserPointerEffect from "../card/card.laser_pointer.effect.js";
import cardMaturedSavingsEffect from "../card/card.matured_savings.effect.js";
import cardRaderEffect from "../card/card.rader.effect.js";
import cardSatelliteTargetEffect from "../card/card.satellite_target.effect.js";
import cardShieldEffect from "../card/card.shield.effect.js";
import cardSniperGunEffect from "../card/card.sniper_gun.effect.js";
import cardStealthSuitEffect from "../card/card.stealth_suit.effect.js";
import cardVaccineEffect from "../card/card.vaccine.effect.js";
import cardWinLotteryEffect from "../card/card.win_lottery.effect.js";

// 카드 효과 적용 함수
export async function applyCardEffect(roomId:number, CardType: number, userId: string, targetUserId: string) {

  const user = await getUserFromRoom(roomId, userId);
  const target = await getUserFromRoom(roomId, targetUserId);
  // 유효성 검증
  if (!user || !target || !user.character || !target.character) return; 

  // 가장 앞 순서에 있는 카드 제거
  const cardIndex = user.character.handCards.findIndex(c => c.type === CardType);
  if (cardIndex !== -1) 
      user.character.handCards.splice(cardIndex, 1); 
  else return; // cardIndex = -1 일 경우 ; 아무 변화 없이 종료

  // 소지한 카드 제거 후 효과 적용  
  switch (CardType) {
    case 1: //'BBANG':
      cardBbangEffect(roomId, userId, targetUserId);
      break;
    case 2: //'BIGBBANG':
      await cardBigBbangEffect(roomId, userId, targetUserId);
      break;
    case 3: //'SHIELD':
      cardShieldEffect(roomId, userId, targetUserId);
      break;
    case 4: // 'VACCINE':
      cardVaccineEffect(roomId, userId);
      break;
    case 5: // 'CALL_119':
      cardCall119Effect(roomId, userId, targetUserId);
      break;
    case 6: // 'DEATH_MATCH':
      cardDeathMatchEffect(roomId, userId, targetUserId);
      break;
    case 7: // 'GUIRRILLA':
      await cardGuerrillaEffect(roomId, userId, targetUserId);
      break;
    case 8: // 'ABSORB':
      cardAbsorbEffect(roomId, userId, targetUserId);
      break;
    case 9: // 'HALLUCINATION':
      cardHallucinationEffect(roomId, userId, targetUserId);
      break;
    case 10: // 'FLEA_MARKET':
      cardFleaMarketEffect(roomId, userId, targetUserId);
      break;
    case 11: // 'MATURED_SAVINGS':
      cardMaturedSavingsEffect(roomId, userId, targetUserId);
      break;
    case 12: // 'WIN_LOTTERY':
      cardWinLotteryEffect(roomId, userId, targetUserId);
      break;

    // 무기 카드  
    case 13: // 'SNIPER_GUN':
      cardSniperGunEffect(roomId, userId);
      break;
    case 14: // 'HAND_GUN':
      cardHandGunEffect(roomId, userId);
      break;
    case 15: // 'DESERT_EAGLE':
      cardDesertEagleEffect(roomId, userId);
      break;
    case 16: // 'AUTO_RIFLE':
      cardAutoRifleEffect(roomId, userId);
      break;

    // 장비 카드
    case 17: // 'LASER_POINTER':
      cardLaserPointerEffect(roomId, userId);
      break;
    case 18: // 'RADER':
      cardRaderEffect(roomId, userId);
      break;
    case 19: // 'AUTO_SHIELD':
      cardAutoShieldEffect(roomId, userId);
      break;
    case 20: // 'STEATLH_SUIT':
      cardStealthSuitEffect(roomId, userId);
      break;

    // 디버프 카드  
    case 21: // 'CONTAINMENT_UNIT':
      cardContainmentUnitEffect(roomId, userId, targetUserId);
      break;
    case 22: // 'SATELLITE_TARGET':
      cardSatelliteTargetEffect(roomId, userId, targetUserId);
      break;
    case 23: // 'BOMB':
      cardBombEffect(roomId, userId, targetUserId);
      break;
    default:
      console.log('Unknown card type');
  }
}

