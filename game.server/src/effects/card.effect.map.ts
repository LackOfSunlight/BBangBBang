import { CardType } from '../generated/common/enums';
import { EffectHandler } from '../types/effect.handler';
import { vaccineEffectHandler } from './solo/vaccine.effect.handler';
import { bbangEffectHandler } from './interactive/bbang.effect.handler';
import { deathMatchEffectHandler } from './interactive/deathMatch.effect.handler';

/**
 * 카드 타입별 이펙트 핸들러 매핑 테이블입니다.
 * 새로운 카드를 추가할 때 이 맵에 등록하면 자동으로 파이프라인에서 처리됩니다.
 */
export const cardEffectHandlerMapper: Record<string, EffectHandler> = {
  // 파일럿 카드들
  [CardType.VACCINE.toString()]: vaccineEffectHandler,
  [CardType.BBANG.toString()]: bbangEffectHandler,
  [CardType.DEATH_MATCH.toString()]: deathMatchEffectHandler,
};

/**
 * 카드 타입에 해당하는 이펙트 핸들러를 가져옵니다.
 * 지원되지 않는 카드 타입인 경우 null을 반환합니다.
 */
export function getCardEffectHandler(cardType: CardType): EffectHandler | null {
  const handler = cardEffectHandlerMapper[cardType.toString()];
  return handler || null;
}

/**
 * 단독 카드 타입 목록입니다.
 * 액터 로딩 시 user만 필요함을 나타냅니다.
 */
export const soloCardTypes = new Set([
  CardType.VACCINE.toString(),
  CardType.MATURED_SAVINGS.toString(),
  CardType.WIN_LOTTERY.toString(),
  CardType.FLEA_MARKET.toString(),
  CardType.CALL_119.toString(),
]);

/**
 * 상호작용 카드 타입 목록입니다.
 * 액터 로딩 시 user와 target이 모두 필요함을 나타냅니다.
 */
export const interactiveCardTypes = new Set([
  CardType.BBANG.toString(),
  CardType.BIG_BBANG.toString(),
  CardType.SHIELD.toString(),
  CardType.DEATH_MATCH.toString(),
  CardType.GUERRILLA.toString(),
  CardType.ABSORB.toString(),
  CardType.HALLUCINATION.toString(),
]);

/**
 * 카드가 단독 카드인지 확인합니다.
 */
export function isSoloCard(cardType: string): boolean {
  return soloCardTypes.has(cardType);
}

/**
 * 카드가 상호작용 카드인지 확인합니다.
 */
export function isInteractiveCard(cardType: string): boolean {
  return interactiveCardTypes.has(cardType);
}
