import { CardType, GlobalFailCode } from '../generated/common/enums';
import { UserData, RoomData } from '../generated/common/types';
import { Result, ok, err } from '../types/result';
import { UpdatePayload } from '../types/update.payload';
import { getCardEffectHandler, isSoloCard, isInteractiveCard } from '../effects/card.effect.map';
import { getRoom, getUserFromRoom, updateCharacterFromRoom, updateRoomDataFromRoom } from '../utils/room.utils';
import { sendNotificationGamePackets } from '../utils/notification.sender';

/**
 * 카드 사용 서비스입니다.
 * 카드 사용의 전체 파이프라인을 관리합니다:
 * 1. 액터 로딩 (유저, 타겟, 방)
 * 2. 이펙트 실행 (순수 계산)
 * 3. 상태 적용 (실제 변경)
 * 4. 알림 전송
 */
export class CardUseService {
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
      return { success: false, failcode: this.mapErrorToFailCode(actors.error) };
    }

    // 4. 이펙트 핸들러 실행 (순수 계산)
    const effectResult = this.executeEffect(effectHandler, actors.value); // actors.value = { user: UserData; target?: UserData; room: RoomData }
    if (!effectResult.ok) {
      return { success: false, failcode: this.mapErrorToFailCode(effectResult.error) };
    }

    // 5. 상태 적용 및 알림 전송
    this.applyChanges(roomId, effectResult.value);

    return { success: true, failcode: GlobalFailCode.NONE_FAILCODE };
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
      console.error('[CardUseService] 액터 로딩 실패:', error);
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
      console.error('[CardUseService] 이펙트 실행 실패:', error);
      return err('EFFECT_EXECUTION_FAILED');
    }
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

      console.log(`[CardUseService] 상태 적용 완료: roomId=${roomId}, userId=${payload.userId}, targetUserId=${payload.targetUserId}`);

    } catch (error) {
      console.error('[CardUseService] 상태 적용 실패:', error);
        throw error; // 상위에서 처리하도록 에러 전파
      }
    }


  /**
   * 에러 메시지를 GlobalFailCode로 매핑합니다.
   */
  private mapErrorToFailCode(error: string): GlobalFailCode {
    switch (error) {
      case 'ROOM_NOT_FOUND':
        return GlobalFailCode.ROOM_NOT_FOUND;
      case 'USER_NOT_FOUND':
        return GlobalFailCode.CHARACTER_NOT_FOUND;
      case 'TARGET_USER_NOT_FOUND':
        return GlobalFailCode.CHARACTER_NOT_FOUND;
      case 'TARGET_USER_REQUIRED':
        return GlobalFailCode.INVALID_REQUEST;
      case 'LOAD_ACTORS_FAILED':
        return GlobalFailCode.UNKNOWN_ERROR;
      case 'EFFECT_EXECUTION_FAILED':
        return GlobalFailCode.UNKNOWN_ERROR;
      case 'CHARACTER_NOT_FOUND':
        return GlobalFailCode.CHARACTER_NOT_FOUND;
      case 'HP_ALREADY_MAX':
        return GlobalFailCode.INVALID_REQUEST;
      case 'TARGET_DEAD':
        return GlobalFailCode.INVALID_REQUEST;
      case 'TARGET_CONTAINED':
        return GlobalFailCode.CHARACTER_CONTAINED;
      case 'NO_BBANG_CARD':
        return GlobalFailCode.CHARACTER_NO_CARD;
      case 'INVALID_BBANG_STATE':
        return GlobalFailCode.CHARACTER_STATE_ERROR;
      default:
        return GlobalFailCode.UNKNOWN_ERROR;
    }
  }
}
