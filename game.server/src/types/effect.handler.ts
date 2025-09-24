import { UserData, RoomData } from '../generated/common/types';
import { Result } from './result';
import { UpdatePayload } from './update.payload';

/**
 * 단독 카드 이펙트 핸들러 타입입니다.
 * 타겟이 필요 없는 카드 (백신, 복권 등)에서 사용됩니다.
 */
export type SoloEffectHandler = (
  user: UserData,
  room: RoomData
) => Result<UpdatePayload>;

/**
 * 상호작용 카드 이펙트 핸들러 타입입니다.
 * 타겟이 필요한 카드 (빵야, 방패 등)에서 사용됩니다.
 */
export type InteractiveEffectHandler = (
  user: UserData,
  target: UserData,
  room: RoomData
) => Result<UpdatePayload>;

/**
 * 통합 이펙트 핸들러 타입입니다.
 * 단독/상호작용 카드를 구분하지 않고 사용할 수 있습니다.
 */
export type EffectHandler = SoloEffectHandler | InteractiveEffectHandler;
