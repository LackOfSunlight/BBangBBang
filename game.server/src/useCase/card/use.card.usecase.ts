import { CardType, GlobalFailCode } from '../../generated/common/enums';
import { UserData, RoomData } from '../../generated/common/types';
import { GamePacket } from '../../generated/gamePacket';
import { Result, ok, err } from '../../types/result';
import { UpdatePayload } from '../../types/update.payload';
import { getCardEffectHandler, isSoloCard, isInteractiveCard } from '../../effects/card.effect.map';
import { getRoom, getUserFromRoom, updateCharacterFromRoom, updateRoomDataFromRoom } from '../../utils/room.utils';
import { createUserUpdateNotificationGamePacket } from '../../utils/notification.builder';

/**
 * 카드 사용 UseCase입니다.
 * 카드 타입에 따라 단독/상호작용 카드를 자동으로 구분하여 처리합니다.
 */
export class UseCardUseCase {
  /**
   * 카드를 사용합니다.
   */
  execute(
    userId: string,
    roomId: number,
    cardType: CardType,
    targetUserId?: string
  ): { success: boolean; failcode: GlobalFailCode; notificationGamePackets?: GamePacket[] } {
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
      console.error(`[UseCardUseCase] 액터 로딩 실패: ${actors.error}`);
      return { success: false, failcode: this.mapErrorToFailCode(actors.error) };
    }

    // 4. 이펙트 핸들러 실행 (순수 계산, 비즈니스 로직)
    const effectResult = this.executeEffect(effectHandler, actors.value);
    if (!effectResult.ok) {
      console.error(`[UseCardUseCase] 이펙트 실행 실패: ${effectResult.error}`);
      return { success: false, failcode: this.mapErrorToFailCode(effectResult.error) };
    }

    // 5. 카드 소비 처리
    this.consumeCard(roomId, userId, cardType, actors.value.room);

    // 6. 상태 반영 및 알림 패킷 생성
    const notificationPackets = this.applyResults(roomId, effectResult.value);

    return { 
      success: true, 
      failcode: GlobalFailCode.NONE_FAILCODE,
      notificationGamePackets: notificationPackets
    };
  }

  /**
   * 카드 타입에 따라 필요한 액터들을 로딩합니다.
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
      console.error('[UseCardUseCase] 액터 로딩 실패:', error);
      return err('LOAD_ACTORS_FAILED');
    }
  }

  /**
   * 이펙트 함수를 실행합니다.
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
      console.error('[UseCardUseCase] 이펙트 실행 실패:', error);
      return err('EFFECT_EXECUTION_FAILED');
    }
  }

  /**
   * 카드를 소비합니다.
   */
  private consumeCard(roomId: number, userId: string, cardType: CardType, room: RoomData): void {
    try {
      const { cardManager } = require('../../managers/card.manager');
      const user = room.users.find(u => u.id === userId);
      
      if (user?.character) {
        // 카드 매니저를 통해 카드 제거
        cardManager.removeCard(user, { id: roomId }, cardType);
        console.log(`[UseCardUseCase] 카드 소비 완료: userId=${userId}, cardType=${cardType}`);
      }
    } catch (error) {
      console.error('[UseCardUseCase] 카드 소비 실패:', error);
      // 카드 소비 실패는 게임 진행에 치명적이지 않으므로 로그만 남기고 계속 진행
    }
  }

  /**
   * 계산된 결과를 실제 상태에 적용하고 알림 패킷을 생성합니다.
   */
  private applyResults(roomId: number, payload: UpdatePayload): GamePacket[] {
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

      console.log(`[UseCardUseCase] 상태 적용 완료: roomId=${roomId}, userId=${payload.userId}, targetUserId=${payload.targetUserId}`);

      // 4. 알림 패킷 반환 (전송하지 않음)
      return payload.notificationGamePackets || [];

    } catch (error) {
      console.error('[UseCardUseCase] 상태 적용 실패:', error);
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
      case 'TARGET_USER_NOT_FOUND':
        return GlobalFailCode.CHARACTER_NOT_FOUND;
      case 'TARGET_USER_REQUIRED':
      case 'INVALID_REQUEST':
        return GlobalFailCode.INVALID_REQUEST;
      case 'LOAD_ACTORS_FAILED':
      case 'EFFECT_EXECUTION_FAILED':
        return GlobalFailCode.UNKNOWN_ERROR;
      default:
        console.warn(`[UseCardUseCase] 알 수 없는 에러 코드: ${error}`);
        return GlobalFailCode.UNKNOWN_ERROR;
    }
  }
}
