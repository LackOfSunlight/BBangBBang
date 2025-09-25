import { CardType, GlobalFailCode, CharacterStateType } from '../generated/common/enums';
import { UserData, RoomData, CardData } from '../generated/common/types';
import { GamePacket } from '../generated/gamePacket';
import { Result, ok, err } from '../types/result';
import { UpdatePayload } from '../types/update.payload';
import { getCardEffectHandler, isSoloCard, isInteractiveCard } from '../effects/card.effect.map';
import { getRoom, getUserFromRoom, updateCharacterFromRoom, updateRoomDataFromRoom } from '../utils/room.utils';
import { sendNotificationGamePackets } from '../utils/notification.sender';
import { createUserUpdateNotificationGamePacket } from '../utils/notification.builder';
import { cardManager } from '../managers/card.manager';
import { fleaMarketNotificationForm, userUpdateNotificationPacketForm } from '../factory/packet.pactory';

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
      console.error(`[GameActionService] 액터 로딩 실패: ${actors.error}`);
      return { success: false, failcode: this.mapErrorToFailCode(actors.error) };
    }

    // 4. 이펙트 핸들러 실행 (순수 계산, 비즈니스 로직)
    const effectResult = this.executeEffect(effectHandler, actors.value);
    if (!effectResult.ok) {
      console.error(`[GameActionService] 이펙트 실행 실패: ${effectResult.error}`);
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
   * 특정 카드 사용후 클라이언트로부터 받은 반응(reaction)을 해결합니다.
   * 사용자의 현재 상태에 따라 적절한 처리를 수행합니다.
   */
  resolveReaction( 
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

      // 4. 상태 반영 및 알림 패킷 생성
      const notificationPackets = this.applyResults(roomId, result.value);

      return { 
        success: true, 
        failcode: GlobalFailCode.NONE_FAILCODE,
        notificationGamePackets: notificationPackets
      };

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
   * 페이즈 변경을 처리합니다.
   * TODO: 게임 매니저에 페이즈 변경 메서드 추가 후 연동 필요
   */
  private handlePhaseChange(roomId: number, phaseType: number): void {
    try {
      const { gameManager } = require('../managers/game.manager');
      console.log(`[GameActionService] 페이즈 변경 처리: roomId=${roomId}, phaseType=${phaseType}`);
      
      // TODO: gameManager.changePhase(roomId, phaseType) 호출 필요
      // TODO: 페이즈 변경 시 플레이어 상태 초기화 로직 추가 필요
      // TODO: 페이즈 변경 알림 패킷 생성 및 전송 필요
    } catch (error) {
      console.error('[GameActionService] 페이즈 변경 처리 실패:', error);
    }
  }

  /**
   * 타이머 업데이트를 처리합니다.
   * TODO: 게임 매니저에 타이머 업데이트 메서드 추가 후 연동 필요
   */
  private handleTimerUpdate(roomId: number, nextPhaseAt: string): void {
    try {
      console.log(`[GameActionService] 타이머 업데이트: roomId=${roomId}, nextPhaseAt=${nextPhaseAt}`);

      // TODO: gameManager.updateTimer(roomId, nextPhaseAt) 호출 필요
      // TODO: 타이머 스케줄링 로직 추가 필요
      // TODO: 타이머 만료 시 자동 페이즈 전환 로직 추가 필요
    } catch (error) {
      console.error('[GameActionService] 타이머 업데이트 처리 실패:', error);
    }
  }

  /**
   * 플리마켓 카드 선택을 처리합니다.
   * GameActionService 패턴에 따라 비즈니스 로직을 처리하고 결과를 반환합니다.
   */
  pickFleaMarketCard(
    userId: string,
    roomId: number,
    pickIndex: number
  ): { success: boolean; failcode: GlobalFailCode; notificationGamePackets?: GamePacket[] } {
    try {
      // 1. 액터 로딩
      const room = getRoom(roomId);
      const user = getUserFromRoom(roomId, userId);

      // 2. 플리마켓 카드 검증
      const fleaMarketCards = cardManager.roomFleaMarketCards.get(roomId);
      const pickNumbers = cardManager.fleaMarketPickIndex.get(roomId);

      if (!fleaMarketCards || !pickNumbers) {
        return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
      }

      // 3. 카드 선택 처리
      const selectedCard = fleaMarketCards[pickIndex];
      pickNumbers.push(pickIndex);

      // 4. 사용자에게 카드 추가
      const existCard = user.character!.handCards.find((c) => c.type === selectedCard);
      if (existCard) {
        existCard.count += 1;
      } else {
        user.character!.handCards.push({ type: selectedCard, count: 1 });
      }
      user.character!.handCardsCount += 1;

      // 5. 상태 업데이트
      user.character!.stateInfo!.state = CharacterStateType.FLEA_MARKET_WAIT;
      user.character!.stateInfo!.nextState = CharacterStateType.NONE_CHARACTER_STATE;
      user.character!.stateInfo!.nextStateAt = '0';

      // 6. 다음 플레이어 턴 설정
      for (let i = 0; i < room.users.length; i++) {
        if (room.users[i].id === user.id) {
          const nextIndex = (i + 1) % room.users.length;
          const nextUser = room.users[nextIndex];

          if (nextUser.character?.stateInfo?.nextState !== CharacterStateType.NONE_CHARACTER_STATE) {
            nextUser.character!.stateInfo!.state = CharacterStateType.FLEA_MARKET_TURN;
            nextUser.character!.stateInfo!.nextState = CharacterStateType.FLEA_MARKET_WAIT;
            nextUser.character!.stateInfo!.nextStateAt = '5';
            break;
          }
        }
      }

      // 7. 모든 플레이어가 대기 상태인지 확인
      const allWaiting = room.users
        .filter((u) => u.character?.stateInfo?.state !== CharacterStateType.CONTAINED)
        .every((u) => u.character?.stateInfo?.state === CharacterStateType.FLEA_MARKET_WAIT);

      if (allWaiting) {
        // 모든 플레이어 상태 초기화
        for (const u of room.users) {
          if (u.character?.stateInfo?.state === CharacterStateType.CONTAINED) continue;

          u.character!.stateInfo!.state = CharacterStateType.NONE_CHARACTER_STATE;
          u.character!.stateInfo!.nextState = CharacterStateType.NONE_CHARACTER_STATE;
          u.character!.stateInfo!.nextStateAt = '0';
        }

        // 플리마켓 정리
        cardManager.fleaMarketPickIndex.set(roomId, []);
        cardManager.roomFleaMarketCards.set(roomId, []);
      }

      // 8. 알림 패킷 생성
      const fleaMarketGamePacket = fleaMarketNotificationForm(fleaMarketCards, pickNumbers);
      const userUpdateGamePacket = userUpdateNotificationPacketForm(room.users);

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE,
        notificationGamePackets: [fleaMarketGamePacket, userUpdateGamePacket]
      };

    } catch (error) {
      console.error('[GameActionService] 플리마켓 카드 선택 실패:', error);
      return { success: false, failcode: GlobalFailCode.ROOM_NOT_FOUND };
    }
  }

  /**
   * 카드 파괴를 처리합니다.
   * GameActionService 패턴에 따라 비즈니스 로직을 처리하고 결과를 반환합니다.
   */
  destroyCards(
    userId: string,
    roomId: number,
    destroyCards: CardData[]
  ): { success: boolean; failcode: GlobalFailCode; handCards?: CardData[] } {
    try {
      // 1. 액터 로딩
      const room = getRoom(roomId);
      const user = getUserFromRoom(roomId, userId);

      // 2. 카드 파괴 처리
      for (const destroyCard of destroyCards) {
        const handCard = user.character!.handCards.find(card => card.type === destroyCard.type);
        if (handCard) {
          handCard.count -= destroyCard.count;
          if (handCard.count <= 0) {
            user.character!.handCards = user.character!.handCards.filter(card => card !== handCard);
          }
        }
      }

      // 3. 핸드카드 개수 업데이트
      user.character!.handCardsCount = user.character!.handCards.reduce((sum, card) => sum + card.count, 0);

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE,
        handCards: user.character!.handCards
      };

    } catch (error) {
      console.error('[GameActionService] 카드 파괴 실패:', error);
      return { success: false, failcode: GlobalFailCode.ROOM_NOT_FOUND };
    }
  }

  /**
   * 카드 선택을 처리합니다.
   * GameActionService 패턴에 따라 비즈니스 로직을 처리하고 결과를 반환합니다.
   */
  selectCard(
    userId: string,
    roomId: number,
    selectType: number,
    selectCardType: number
  ): { success: boolean; failcode: GlobalFailCode } {
    try {
      // 1. 액터 로딩
      const room = getRoom(roomId);
      const user = getUserFromRoom(roomId, userId);

      // TODO: 카드 선택 로직 구현 필요
      // - selectType에 따른 카드 검증
      // - selectCardType이 유효한지 확인
      // - 선택 가능한 상태인지 확인

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE
      };

    } catch (error) {
      console.error('[GameActionService] 카드 선택 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }

  /**
   * 사용자 로그인을 처리합니다.
   * GameActionService 패턴에 따라 비즈니스 로직을 처리하고 결과를 반환합니다.
   */
  async loginUser(
    email: string,
    password: string
  ): Promise<{ success: boolean; failcode: GlobalFailCode; userData?: any; token?: string }> {
    try {
      // 1. 입력 필드 검증
      if (!email || !password) {
        return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
      }

      // 2. 사용자 데이터 조회
      const { authService } = require('./auth.service');
      const userResult = await authService.getUserByEmail(email);
      
      if (!userResult.ok) {
        return { success: false, failcode: GlobalFailCode.AUTHENTICATION_FAILED };
      }

      // 3. 비밀번호 검증
      const passwordResult = await authService.checkUserPassword({ email, password }, userResult.value.password);
      
      if (!passwordResult.ok || !passwordResult.value) {
        return { success: false, failcode: GlobalFailCode.AUTHENTICATION_FAILED };
      }

      // 4. 토큰 생성 및 설정
      const tokenResult = await authService.setTokenService(userResult.value.id, userResult.value.email);
      
      if (!tokenResult.ok) {
        return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
      }

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE,
        userData: {
          id: userResult.value.id,
          email: userResult.value.email,
          nickname: userResult.value.nickname
        },
        token: tokenResult.value
      };

    } catch (error) {
      console.error('[GameActionService] 로그인 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }

  /**
   * 사용자 회원가입을 처리합니다.
   * GameActionService 패턴에 따라 비즈니스 로직을 처리하고 결과를 반환합니다.
   */
  async registerUser(
    email: string,
    nickname: string,
    password: string
  ): Promise<{ success: boolean; failcode: GlobalFailCode; userData?: any }> {
    try {
      // 1. 입력 필드 검증
      if (!email || !nickname || !password) {
        return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
      }

      // 2. 중복 사용자 검증
      const { authService } = require('./auth.service');
      const userExistsResult = await authService.checkUserExists(email, nickname);
      
      if (!userExistsResult.ok || userExistsResult.value) {
        return { success: false, failcode: GlobalFailCode.AUTHENTICATION_FAILED };
      }

      // 3. 사용자 생성
      const userResult = await authService.createUser({ email, nickname, password });
      
      if (!userResult.ok) {
        return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
      }

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE,
        userData: {
          id: userResult.value.id,
          email: userResult.value.email,
          nickname: userResult.value.nickname
        }
      };

    } catch (error) {
      console.error('[GameActionService] 회원가입 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }

  /**
   * 사용자 로그아웃을 처리합니다.
   * GameActionService 패턴에 따라 비즈니스 로직을 처리하고 결과를 반환합니다.
   */
  async logoutUser(
    userId: number
  ): Promise<{ success: boolean; failcode: GlobalFailCode }> {
    try {
      // 1. 사용자 ID 검증
      if (!userId) {
        return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
      }

      // 2. 토큰 제거
      const { authService } = require('./auth.service');
      const result = await authService.removeTokenUserDB(userId);
      
      if (!result.ok) {
        return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
      }

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE
      };

    } catch (error) {
      console.error('[GameActionService] 로그아웃 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }

  /**
   * 카드를 소비합니다.
   */
  private consumeCard(roomId: number, userId: string, cardType: CardType, room: RoomData): void {
    try {
      const { cardManager } = require('../managers/card.manager');
      const user = room.users.find(u => u.id === userId);
      
      if (user?.character) {
        // 카드 매니저를 통해 카드 제거
        cardManager.removeCard(user, { id: roomId }, cardType);
        console.log(`[GameActionService] 카드 소비 완료: userId=${userId}, cardType=${cardType}`);
      }
    } catch (error) {
      console.error('[GameActionService] 카드 소비 실패:', error);
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
        
        // 페이즈 변경 시 게임 매니저에 알림
        if (payload.roomUpdates.phaseType !== undefined) {
          this.handlePhaseChange(roomId, payload.roomUpdates.phaseType);
        }
        
        // 다음 페이즈 시간 설정
        if (payload.roomUpdates.nextPhaseAt) {
          this.handleTimerUpdate(roomId, payload.roomUpdates.nextPhaseAt);
        }
      }

      console.log(`[GameActionService] 상태 적용 완료: roomId=${roomId}, userId=${payload.userId}, targetUserId=${payload.targetUserId}`);

      // 4. 알림 패킷 반환 (전송하지 않음)
      return payload.notificationGamePackets || [];

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
