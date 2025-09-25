import { CardType, GlobalFailCode, CharacterStateType } from '../../generated/common/enums';
import { UserData, RoomData } from '../../generated/common/types';
import { GamePacket } from '../../generated/gamePacket';
import { Result, ok, err } from '../../types/result';
import { UpdatePayload } from '../../types/update.payload';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { createUserUpdateNotificationGamePacket } from '../../utils/notification.builder';

/**
 * 반응(Reaction) 처리 UseCase입니다.
 * 특정 카드 사용후 클라이언트로부터 받은 반응을 해결합니다.
 */
export class ReactionUseCase {
  /**
   * 특정 카드 사용후 클라이언트로부터 받은 반응(reaction)을 해결합니다.
   */
  execute(
    userId: string,
    roomId: number,
    reactionType: number
  ): { success: boolean; failcode: GlobalFailCode; notificationGamePackets?: GamePacket[] } {
    try {
      // 1. 유효성 검증
      const validation = this.validateRequest(userId, roomId);
      if (!validation.ok) {
        return { success: false, failcode: this.mapErrorToFailCode(validation.error) };
      }

      // 2. 액터 로딩 (반응 reaction 처리는 트리거한 유저 기준의 단독 액션이므로 targetUserId undefined 써줌)
      const actors = this.loadActors(roomId, userId, undefined, CardType.NONE);
      if (!actors.ok) {
        console.error(`[ReactionUseCase] 액터 로딩 실패: ${actors.error}`);
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

      // 4. 상태 반영 및 알림 패킷 생성
      const notificationPackets = this.applyResults(roomId, result.value);

      return { 
        success: true, 
        failcode: GlobalFailCode.NONE_FAILCODE,
        notificationGamePackets: notificationPackets
      };

    } catch (error) {
      console.error('[ReactionUseCase] 반응 해결 실패:', error);
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
   * 액터들을 로딩합니다.
   */
  private loadActors(
    roomId: number,
    userId: string,
    targetUserId: string | undefined,
    cardType: CardType
  ): Result<{ user: UserData; room: RoomData }, string> {
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

      return ok({ user, room });

    } catch (error) {
      console.error('[ReactionUseCase] 액터 로딩 실패:', error);
      return err('LOAD_ACTORS_FAILED');
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

      console.log(`[ReactionUseCase] 상태 적용 완료: roomId=${roomId}, userId=${payload.userId}, targetUserId=${payload.targetUserId}`);

      // 3. 알림 패킷 반환 (전송하지 않음)
      return payload.notificationGamePackets || [];

    } catch (error) {
      console.error('[ReactionUseCase] 상태 적용 실패:', error);
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
      case 'CHARACTER_NOT_FOUND':
      case 'SHOOTER_NOT_FOUND':
      case 'TARGET_NOT_FOUND':
        return GlobalFailCode.CHARACTER_NOT_FOUND;
      case 'INVALID_CHARACTER_STATE':
        return GlobalFailCode.CHARACTER_STATE_ERROR;
      case 'INVALID_REQUEST':
        return GlobalFailCode.INVALID_REQUEST;
      case 'LOAD_ACTORS_FAILED':
        return GlobalFailCode.UNKNOWN_ERROR;
      default:
        console.warn(`[ReactionUseCase] 알 수 없는 에러 코드: ${error}`);
        return GlobalFailCode.UNKNOWN_ERROR;
    }
  }
}
