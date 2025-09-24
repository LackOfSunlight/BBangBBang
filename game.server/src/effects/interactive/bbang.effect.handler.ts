import { CardType, CharacterStateType } from '../../generated/common/enums';
import { UserData, RoomData } from '../../generated/common/types';
import { InteractiveEffectHandler } from '../../types/effect.handler';
import { Result, ok, err } from '../../types/result';
import { UpdatePayload } from '../../types/update.payload';
import { createUserUpdateNotificationGamePacket, createUseCardNotificationGamePacket } from '../../utils/notification.builder';

/**
 * 빵야 카드 이펙트입니다.
 * 타겟을 공격하는 상호작용 카드로, 다양한 상태에 따라 다른 동작을 수행합니다.
 * 
 * 상태별 처리:
 * - 일반 상태: 빵야 시전자/대상 상태 설정
 * - 현피 중: 현피 상태 전환
 * - 게릴라 상태: 특수 처리 (게릴라 서비스 호출)
 */
export const bbangEffectHandler: InteractiveEffectHandler = (
  user: UserData,
  target: UserData,
  room: RoomData
): Result<UpdatePayload> => {
  // 가드 리턴: 캐릭터 정보 없음
  if (!user.character || !target.character) {
    return err('CHARACTER_NOT_FOUND');
  }

  // 가드 리턴: 타겟이 사망 상태
  if (target.character.hp <= 0) {
    return err('TARGET_DEAD');
  }

  // 가드 리턴: 타겟이 감옥 상태
  if (target.character.stateInfo?.state === CharacterStateType.CONTAINED) {
    return err('TARGET_CONTAINED');
  }

  const nowTime = Date.now();
  const currentState = user.character.stateInfo?.state;

  // 상태별 처리
  if (currentState === CharacterStateType.NONE_CHARACTER_STATE) {
    return handleNormalBbang(user, target, room, nowTime);
  } else if (currentState === CharacterStateType.DEATH_MATCH_TURN_STATE) {
    return handleDeathMatchBbang(user, target, room, nowTime);
  } else if (currentState === CharacterStateType.GUERRILLA_TARGET) {
    return handleGuerrillaBbang(user, target, room, nowTime);
  }

  return err('INVALID_BBANG_STATE');
};

/**
 * 일반 상태에서의 빵야 처리
 */
function handleNormalBbang(
  user: UserData,
  target: UserData,
  room: RoomData,
  nowTime: number
): Result<UpdatePayload> {
  const userUpdates = {
    stateInfo: {
      state: CharacterStateType.BBANG_SHOOTER,
      nextState: CharacterStateType.NONE_CHARACTER_STATE,
      nextStateAt: `${nowTime + 10}`,
      stateTargetUserId: target.id,
    }
  };

  const targetUpdates = {
    stateInfo: {
      state: CharacterStateType.BBANG_TARGET,
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
      createUseCardNotificationGamePacket(CardType.BBANG, user.id, target.id),
      createUserUpdateNotificationGamePacket(room.users)
    ]
  };

  return ok(payload);
}

/**
 * 현피 중 빵야 처리
 */
function handleDeathMatchBbang(
  user: UserData,
  target: UserData,
  room: RoomData,
  nowTime: number
): Result<UpdatePayload> {
  const userUpdates = {
    stateInfo: {
      state: CharacterStateType.DEATH_MATCH_STATE,
      nextState: CharacterStateType.DEATH_MATCH_TURN_STATE,
      nextStateAt: `${nowTime + 10}`,
      stateTargetUserId: target.id
    }
  };

  const targetUpdates = {
    stateInfo: {
      state: CharacterStateType.DEATH_MATCH_TURN_STATE,
      nextState: CharacterStateType.DEATH_MATCH_STATE,
      nextStateAt: `${nowTime + 10}`,
      stateTargetUserId: user.id
    }
  };

  const payload: UpdatePayload = {
    userId: user.id,
    targetUserId: target.id,
    characterUpdates: userUpdates,
    targetCharacterUpdates: targetUpdates,
    notificationGamePackets: [
      createUseCardNotificationGamePacket(CardType.BBANG, user.id, target.id),
      createUserUpdateNotificationGamePacket(room.users)
    ]
  };

  return ok(payload);
}

/**
 * 게릴라 상태에서의 빵야 처리
 */
function handleGuerrillaBbang(
  user: UserData,
  target: UserData,
  room: RoomData,
  nowTime: number
): Result<UpdatePayload> {
  const userUpdates = {
    stateInfo: {
      state: CharacterStateType.NONE_CHARACTER_STATE,
      nextState: CharacterStateType.NONE_CHARACTER_STATE,
      nextStateAt: '0',
      stateTargetUserId: '0'
    }
  };

  // TODO: 게릴라 서비스 호출 로직 추가
  // CheckGuerrillaService(room);

  const payload: UpdatePayload = {
    userId: user.id,
    targetUserId: target.id,
    characterUpdates: userUpdates,
    notificationGamePackets: [
      createUseCardNotificationGamePacket(CardType.BBANG, user.id, target.id),
      createUserUpdateNotificationGamePacket(room.users)
    ]
  };

  return ok(payload);
}
