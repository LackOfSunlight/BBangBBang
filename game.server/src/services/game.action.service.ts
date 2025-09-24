import { CardType, GlobalFailCode, CharacterStateType } from '../generated/common/enums';
import { UserData, RoomData } from '../generated/common/types';
import { Result, ok, err } from '../types/result';
import { UpdatePayload } from '../types/update.payload';
import { getCardEffectHandler, isSoloCard, isInteractiveCard } from '../effects/card.effect.map';
import { getRoom, getUserFromRoom, updateCharacterFromRoom, updateRoomDataFromRoom } from '../utils/room.utils';
import { sendNotificationGamePackets } from '../utils/notification.sender';
import { createUserUpdateNotificationGamePacket } from '../utils/notification.builder';

/**
 * 게임 액션 서비스입니다.
 * 카드 사용과 반응 업데이트를 통합하여 관리합니다.
 * 
 * 주요 기능:
 * - 카드 사용 (단독/상호작용 카드)
 * - 반응 업데이트 (현피 실패, 빵야 타겟 등)
 * - 상태 기반 복잡한 게임 플로우 처리
 */
export class GameActionService {
  /**
   * 카드를 사용합니다.
   * 카드 타입에 따라 단독/상호작용 카드를 자동으로 구분하여 처리합니다.
   */
  useCard(
    userId: string,
    roomId: number,
    cardType: CardType,
    targetUserId?: string
  ): { success: boolean; failcode: GlobalFailCode } {
    // 1. 카드 타입 검증
    if (cardType === CardType.NONE) {
      return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
    }

    // 2. 이펙트 핸들러 가져오기
    const effectHandler = getCardEffectHandler(cardType);
    if (!effectHandler) {
      return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
    }

    // 3. 액터 로딩
    const actors = this.loadActors(roomId, userId, targetUserId, cardType);
    if (!actors.ok) {
      console.error(`[GameActionService] 액터 로딩 실패: ${actors.error}`);
      return { success: false, failcode: this.mapErrorToFailCode(actors.error) };
    }

    // 4. 이펙트 핸들러 실행 (순수 계산, 비즈니스 로직)
    const effectResult = this.executeEffect(effectHandler, actors.value);
    if (!effectResult.ok) {
      console.error(`[GameActionService] 이펙트 실행 실패: ${effectResult.error}`);
      return { success: false, failcode: this.mapErrorToFailCode(effectResult.error) };
    }

    // 5. 상태 반영 및 알림 전송
    this.applyChanges(roomId, effectResult.value);

    return { success: true, failcode: GlobalFailCode.NONE_FAILCODE };
  }

  /**
   * 특정 카드 사용후 클라이언트로부터 받은 반응(reaction)을 해결합니다.
   * 사용자의 현재 상태에 따라 적절한 처리를 수행합니다.
   */
  resolveReaction( 
    userId: string,
    roomId: number,
    reactionType: number
  ): { success: boolean; failcode: GlobalFailCode } {
    try {
      // 1. 유효성 검증
      const validation = this.validateRequest(userId, roomId);
      if (!validation.ok) {
        return { success: false, failcode: this.mapErrorToFailCode(validation.error) };
      }

      // 2. 액터 로딩 (반응 reaction 처리는 트리거한 유저 기준의 단독 액션이므로 targetUserId undefined 써줌)
      const actors = this.loadActors(roomId, userId, undefined, CardType.NONE);
      if (!actors.ok) {
        console.error(`[GameActionService] 액터 로딩 실패: ${actors.error}`);
        return { success: false, failcode: this.mapErrorToFailCode(actors.error) };
      }

      const { user, room } = actors.value;

      if (!user?.character?.stateInfo) {
        return { success: false, failcode: GlobalFailCode.CHARACTER_NOT_FOUND };
      }

      // 3. 상태별 비즈니스 로직 처리
      const result = this.executeStateBasedReaction(user, room, reactionType);
      if (!result.ok) {
        return { success: false, failcode: this.mapErrorToFailCode(result.error) };
      }

      // 4. 상태 반영 및 알림 전송
      this.applyChanges(roomId, result.value);

      return { success: true, failcode: GlobalFailCode.NONE_FAILCODE };

    } catch (error) {
      console.error('[GameActionService] 반응 해결 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }

  /**
   * 카드 타입에 따라 필요한 액터들을 로딩합니다.
   * 단독 카드는 user와 room만, 상호작용 카드는 user, target, room을 로딩합니다.
   */
  private loadActors(
    roomId: number,
    userId: string,
    targetUserId: string | undefined,
    cardType: CardType
  ): Result<{ user: UserData; target?: UserData; room: RoomData }, string> {
    try {
      // 방 데이터 로딩
      const room = getRoom(roomId);
      if (!room) {
        return err('ROOM_NOT_FOUND');
      }

      // 사용자 데이터 로딩
      const user = getUserFromRoom(roomId, userId);
      if (!user) {
        return err('USER_NOT_FOUND');
      }

      // 상호작용 카드인 경우 타겟 유저도 로딩
      const cardTypeStr = cardType.toString();
      if (isInteractiveCard(cardTypeStr)) {
        if (!targetUserId) {
          return err('TARGET_USER_REQUIRED');
        }

        const target = getUserFromRoom(roomId, targetUserId);
        if (!target) {
          return err('TARGET_USER_NOT_FOUND');
        }

        return ok({ user, target, room });
      }

      // 단독 카드인 경우
      return ok({ user, room });

    } catch (error) {
      console.error('[GameActionService] 액터 로딩 실패:', error);
      return err('LOAD_ACTORS_FAILED');
    }
  }

  /**
   * 이펙트 함수를 실행합니다.
   * 단독/상호작용 카드를 구분하여 적절한 인자로 호출합니다.
   */
  private executeEffect(
    effect: any,
    actors: { user: UserData; target?: UserData; room: RoomData }
  ): Result<UpdatePayload, string> {
    try {
      // 상호작용 카드인 경우 (target이 있는 경우)
      if (actors.target) {
        return effect(actors.user, actors.target, actors.room);
      }
      
      // 단독 카드인 경우 (target이 없는 경우)
      return effect(actors.user, actors.room);

    } catch (error) {
      console.error('[GameActionService] 이펙트 실행 실패:', error);
      return err('EFFECT_EXECUTION_FAILED');
    }
  }

  /**
   * 요청 유효성을 검증합니다.
   */
  private validateRequest(userId: string, roomId: number): Result<void, string> {
    if (!userId || !roomId) {
      return err('INVALID_REQUEST');
    }

    try {
      getRoom(roomId);
      return ok(undefined);
    } catch (error) {
      return err('ROOM_NOT_FOUND');
    }
  }

  /**
   * 상태 기반 반응을 실행합니다.
   */
  private executeStateBasedReaction(
    user: UserData,
    room: RoomData,
    reactionType: number
  ): Result<UpdatePayload, string> {
    const currentState = user.character?.stateInfo?.state;

    switch (currentState) {
      case CharacterStateType.BBANG_TARGET:
        return this.handleBbangTarget(user, room);
      
      case CharacterStateType.DEATH_MATCH_TURN_STATE:
        return this.handleDeathMatchFailure(user, room);
      
      case CharacterStateType.DEATH_MATCH_STATE:
        // 현피 대기 상태에서는 아무것도 하지 않음
        return ok({
          userId: user.id,
          characterUpdates: {},
          notificationGamePackets: []
        });
      
      default:
        return err('INVALID_CHARACTER_STATE');
    }
  }

  /**
   * 빵야 타겟 처리 (데미지 + 상태 초기화)
   */
  private handleBbangTarget(user: UserData, room: RoomData): Result<UpdatePayload, string> {
    if (!user.character?.stateInfo) {
      return err('CHARACTER_NOT_FOUND');
    }

    const shooterId = user.character.stateInfo.stateTargetUserId;
    const shooter = room.users.find(u => u.id === shooterId);
    
    if (!shooter?.character) {
      return err('SHOOTER_NOT_FOUND');
    }

    // 데미지 계산 (기본 1, 무기 효과 적용)
    let damage = 1;
    // TODO: 무기 데미지 효과 적용
    // damage = weaponDamageEffect(damage, shooter.character);

    // 체력 감소
    const newHp = Math.max(0, user.character.hp - damage);

    // 상태 초기화
    const userUpdates = {
      hp: newHp,
      stateInfo: {
        state: CharacterStateType.NONE_CHARACTER_STATE,
        nextState: CharacterStateType.NONE_CHARACTER_STATE,
        nextStateAt: '0',
        stateTargetUserId: '0'
      }
    };

    const payload: UpdatePayload = {
      userId: user.id,
      characterUpdates: userUpdates,
      notificationGamePackets: [
        createUserUpdateNotificationGamePacket(room.users)
      ]
    };

    return ok(payload);
  }

  /**
   * 현피 실패 처리 (체력 감소 + 상태 초기화)
   */
  private handleDeathMatchFailure(user: UserData, room: RoomData): Result<UpdatePayload, string> {
    if (!user.character?.stateInfo) {
      return err('CHARACTER_NOT_FOUND');
    }

    const targetUserId = user.character.stateInfo.stateTargetUserId;
    const target = room.users.find(u => u.id === targetUserId);

    if (!target?.character) {
      return err('TARGET_NOT_FOUND');
    }

    // 체력 감소
    const newHp = Math.max(0, user.character.hp - 1);

    // 사용자 상태 초기화
    const userUpdates = {
      hp: newHp,
      stateInfo: {
        state: CharacterStateType.NONE_CHARACTER_STATE,
        nextState: CharacterStateType.NONE_CHARACTER_STATE,
        nextStateAt: '0',
        stateTargetUserId: '0'
      }
    };

    // 타겟 상태 초기화
    const targetUpdates = {
      stateInfo: {
        state: CharacterStateType.NONE_CHARACTER_STATE,
        nextState: CharacterStateType.NONE_CHARACTER_STATE,
        nextStateAt: '0',
        stateTargetUserId: '0'
      }
    };

    const payload: UpdatePayload = {
      userId: user.id,
      targetUserId: target.id,
      characterUpdates: userUpdates,
      targetCharacterUpdates: targetUpdates,
      notificationGamePackets: [
        createUserUpdateNotificationGamePacket(room.users)
      ]
    };

    return ok(payload);
  }

  /**
   * 계산된 변경사항을 실제 상태에 적용하고 알림을 전송합니다.
   */
  private applyChanges(roomId: number, payload: UpdatePayload): void {
    try {
      // 1. 유저 캐릭터 데이터 업데이트
      if (payload.characterUpdates && Object.keys(payload.characterUpdates).length > 0) {
        updateCharacterFromRoom(roomId, payload.userId, payload.characterUpdates);
      }

      // 2. 타겟 유저 캐릭터 데이터 업데이트 (상호작용 카드인 경우)
      if (payload.targetUserId && payload.targetCharacterUpdates && Object.keys(payload.targetCharacterUpdates).length > 0) {
        updateCharacterFromRoom(roomId, payload.targetUserId, payload.targetCharacterUpdates);
      }

      // 3. 방 데이터 업데이트 (덱, 페이즈 등)
      if (payload.roomUpdates && Object.keys(payload.roomUpdates).length > 0) {
        updateRoomDataFromRoom(roomId, payload.roomUpdates);
      }

      // 4. 알림 전송
      if (payload.notificationGamePackets && payload.notificationGamePackets.length > 0) {
        sendNotificationGamePackets(roomId, payload.notificationGamePackets);
      }

      console.log(`[GameActionService] 상태 적용 완료: roomId=${roomId}, userId=${payload.userId}, targetUserId=${payload.targetUserId}`);

    } catch (error) {
      console.error('[GameActionService] 상태 적용 실패:', error);
      throw error; // 상위에서 처리하도록 에러 전파
    }
  }

  /**
   * 에러 메시지를 GlobalFailCode로 매핑합니다.
   * 기존 enums.ts의 모든 에러 코드를 활용하여 세밀한 에러 처리를 제공합니다.
   */
  private mapErrorToFailCode(error: string): GlobalFailCode {
    switch (error) {
      // 방 관련 에러
      case 'ROOM_NOT_FOUND':
        return GlobalFailCode.ROOM_NOT_FOUND;
      case 'INVALID_ROOM_STATE':
        return GlobalFailCode.INVALID_ROOM_STATE;
      
      // 캐릭터 관련 에러
      case 'CHARACTER_NOT_FOUND':
      case 'USER_NOT_FOUND':
      case 'TARGET_USER_NOT_FOUND':
      case 'SHOOTER_NOT_FOUND':
      case 'TARGET_NOT_FOUND':
        return GlobalFailCode.CHARACTER_NOT_FOUND;
      case 'CHARACTER_STATE_ERROR':
      case 'INVALID_BBANG_STATE':
      case 'INVALID_CHARACTER_STATE':
        return GlobalFailCode.CHARACTER_STATE_ERROR;
      case 'CHARACTER_NO_CARD':
      case 'NO_BBANG_CARD':
        return GlobalFailCode.CHARACTER_NO_CARD;
      case 'TARGET_CONTAINED':
        return GlobalFailCode.CHARACTER_CONTAINED;
      
      // 요청 관련 에러
      case 'INVALID_REQUEST':
      case 'TARGET_USER_REQUIRED':
      case 'HP_ALREADY_MAX':
      case 'TARGET_DEAD':
      case 'CARD_ALREADY_USED':
        return GlobalFailCode.INVALID_REQUEST;
      
      // 인증 관련 에러
      case 'AUTHENTICATION_FAILED':
        return GlobalFailCode.AUTHENTICATION_FAILED;
      
      // 시스템 에러
      case 'LOAD_ACTORS_FAILED':
      case 'EFFECT_EXECUTION_FAILED':
      case 'ROOM_UPDATE_FAILED':
      case 'NOTIFICATION_SEND_FAILED':
        return GlobalFailCode.UNKNOWN_ERROR;
      
      // 기본값
      default:
        console.warn(`[GameActionService] 알 수 없는 에러 코드: ${error}`);
        return GlobalFailCode.UNKNOWN_ERROR;
    }
  }
}
