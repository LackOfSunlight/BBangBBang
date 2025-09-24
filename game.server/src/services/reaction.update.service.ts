import { CharacterStateType, GlobalFailCode } from '../generated/common/enums';
import { UserData, RoomData } from '../generated/common/types';
import { Result, ok, err } from '../types/result';
import { UpdatePayload } from '../types/update.payload';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../utils/room.utils';
import { sendNotificationGamePackets } from '../utils/notification.sender';
import { createUserUpdateNotificationGamePacket } from '../utils/notification.builder';

/**
 * 반응 업데이트 서비스입니다.
 * 현피, 빵야 등의 상태 기반 플로우를 처리합니다.
 * 
 * 주요 처리:
 * - 현피 실패 처리 (체력 감소 + 상태 초기화)
 * - 빵야 타겟 처리 (데미지 + 상태 초기화)
 * - 기타 상태 기반 처리
 */
export class ReactionUpdateService {
  /**
   * 반응 업데이트를 처리합니다.
   * 사용자의 현재 상태에 따라 적절한 처리를 수행합니다.
   */
  updateReaction(
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

      // 2. 사용자 및 방 데이터 로딩
      const user = getUserFromRoom(roomId, userId);
      const room = getRoom(roomId);

      if (!user?.character?.stateInfo) {
        return { success: false, failcode: GlobalFailCode.CHARACTER_NOT_FOUND };
      }

      // 3. 상태별 처리
      const result = this.handleStateBasedReaction(user, room, reactionType);
      if (!result.ok) {
        return { success: false, failcode: this.mapErrorToFailCode(result.error) };
      }

      // 4. 상태 적용 및 알림 전송
      this.applyReactionChanges(roomId, result.value);

      return { success: true, failcode: GlobalFailCode.NONE_FAILCODE };

    } catch (error) {
      console.error('[ReactionUpdateService] 반응 업데이트 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
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
   * 상태 기반 반응을 처리합니다.
   */
  private handleStateBasedReaction(
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
   * 반응 변경사항을 적용합니다.
   */
  private applyReactionChanges(roomId: number, payload: UpdatePayload): void {
    try {
      // 1. 유저 캐릭터 데이터 업데이트
      if (payload.characterUpdates && Object.keys(payload.characterUpdates).length > 0) {
        updateCharacterFromRoom(roomId, payload.userId, payload.characterUpdates);
      }

      // 2. 타겟 유저 캐릭터 데이터 업데이트 (상호작용인 경우)
      if (payload.targetUserId && payload.targetCharacterUpdates && Object.keys(payload.targetCharacterUpdates).length > 0) {
        updateCharacterFromRoom(roomId, payload.targetUserId, payload.targetCharacterUpdates);
      }

      // 3. 알림 전송
      if (payload.notificationGamePackets && payload.notificationGamePackets.length > 0) {
        sendNotificationGamePackets(roomId, payload.notificationGamePackets);
      }

      console.log(`[ReactionUpdateService] 반응 변경사항 적용 완료: roomId=${roomId}, userId=${payload.userId}`);

    } catch (error) {
      console.error('[ReactionUpdateService] 반응 변경사항 적용 실패:', error);
      throw error;
    }
  }

  /**
   * 에러 메시지를 GlobalFailCode로 매핑합니다.
   */
  private mapErrorToFailCode(error: string): GlobalFailCode {
    switch (error) {
      case 'INVALID_REQUEST':
        return GlobalFailCode.INVALID_REQUEST;
      case 'ROOM_NOT_FOUND':
        return GlobalFailCode.ROOM_NOT_FOUND;
      case 'CHARACTER_NOT_FOUND':
      case 'SHOOTER_NOT_FOUND':
      case 'TARGET_NOT_FOUND':
        return GlobalFailCode.CHARACTER_NOT_FOUND;
      case 'INVALID_CHARACTER_STATE':
        return GlobalFailCode.CHARACTER_STATE_ERROR;
      default:
        return GlobalFailCode.UNKNOWN_ERROR;
    }
  }
}
