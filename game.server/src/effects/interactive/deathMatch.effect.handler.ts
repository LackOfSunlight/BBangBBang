import { CardType, CharacterStateType } from '../../generated/common/enums';
import { UserData, RoomData } from '../../generated/common/types';
import { InteractiveEffectHandler } from '../../types/effect.handler';
import { Result, ok, err } from '../../types/result';
import { UpdatePayload } from '../../types/update.payload';
import { createUserUpdateNotificationGamePacket, createUseCardNotificationGamePacket } from '../../utils/notification.builder';

/**
 * 현피 카드 이펙트입니다.
 * 사용자와 타겟을 현피 상태로 만드는 상호작용 카드입니다.
 * 
 * 현피 상태에서는:
 * - 사용자: DEATH_MATCH_TURN_STATE (현피 차례)
 * - 타겟: DEATH_MATCH_STATE (현피 대기)
 * - 빵야 카드만 사용 가능
 */
export const deathMatchEffectHandler: InteractiveEffectHandler = (
  user: UserData,
  target: UserData,
  room: RoomData
): Result<UpdatePayload> => {
  // 가드 리턴: 캐릭터 정보 없음
  if (!user.character || !target.character) {
    return err('CHARACTER_NOT_FOUND');
  }

  // 가드 리턴: 사용자가 빵야 카드를 가지고 있지 않음
  const hasBbangCard = user.character.handCards?.some(card => card.type === CardType.BBANG);
  if (!hasBbangCard) {
    return err('NO_BBANG_CARD');
  }

  // 가드 리턴: 타겟이 감옥 상태
  if (target.character.stateInfo?.state === CharacterStateType.CONTAINED) {
    return err('TARGET_CONTAINED');
  }

  const nowTime = Date.now();

  // 현피 상태 설정
  const userUpdates = {
    stateInfo: {
      state: CharacterStateType.DEATH_MATCH_TURN_STATE,
      nextState: CharacterStateType.NONE_CHARACTER_STATE,
      nextStateAt: `${nowTime + 10}`,
      stateTargetUserId: target.id,
    }
  };

  const targetUpdates = {
    stateInfo: {
      state: CharacterStateType.DEATH_MATCH_STATE,
      nextState: CharacterStateType.NONE_CHARACTER_STATE,
      nextStateAt: `${nowTime + 10}`,
      stateTargetUserId: user.id,
    }
  };

  const payload: UpdatePayload = {
    userId: user.id,
    targetUserId: target.id,
    characterUpdates: userUpdates,
    targetCharacterUpdates: targetUpdates,
    notificationGamePackets: [
      createUseCardNotificationGamePacket(CardType.DEATH_MATCH, user.id, target.id),
      createUserUpdateNotificationGamePacket(room.users)
    ]
  };

  return ok(payload);
};
