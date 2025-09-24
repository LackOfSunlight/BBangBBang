import { CardType, GlobalFailCode, PhaseType, WinType, WarningType, AnimationType } from '../generated/common/enums';
import { CardData, CharacterPositionData, GameStateData, UserData } from '../generated/common/types';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';

/**
 * 알림 패킷 생성을 위한 헬퍼 함수들입니다.
 * 기존 packet.pactory.ts의 함수들을 래핑하여 사용합니다.
 */

/**
 * 유저 정보 업데이트 알림 패킷을 생성합니다.
 * 카드 사용 후 유저들의 상태가 변경되었을 때 전송됩니다.
 */
export function createUserUpdateNotificationGamePacket(users: UserData[]): GamePacket {
  return {
    payload: {
      oneofKind: GamePacketType.userUpdateNotification,
      userUpdateNotification: {
        user: users
      }
    }
  };
}

/**
 * 카드 사용 알림 패킷을 생성합니다.
 * 어떤 카드가 사용되었는지 알려줍니다.
 */
export function createUseCardNotificationGamePacket(
  cardType: CardType, 
  userId: string, 
  targetUserId: string
): GamePacket {
  return {
    payload: {
      oneofKind: GamePacketType.useCardNotification,
      useCardNotification: {
        cardType,
        userId,
        targetUserId: targetUserId || '0'
      }
    }
  };
}

/**
 * 장비 카드 알림을 생성합니다.
 * 무기나 장비가 장착되었을 때 전송됩니다.
 */
export function createEquipCardNotificationGamePacket(cardType: CardType, userId: string): GamePacket {
  return {
    payload: {
      oneofKind: GamePacketType.equipCardNotification,
      equipCardNotification: {
        cardType,
        userId
      }
    }
  };
}

/**
 * 카드 효과 알림을 생성합니다.
 * 카드 효과가 성공/실패했는지 알려줍니다.
 */
export function createCardEffectNotificationGamePacket(
  cardType: CardType, 
  userId: string, 
  success: boolean
): GamePacket {
  return {
    payload: {
      oneofKind: GamePacketType.cardEffectNotification,
      cardEffectNotification: {
        cardType,
        userId,
        success
      }
    }
  };
}

/**
 * 페이즈 업데이트 알림을 생성합니다.
 * 게임 페이즈가 변경되었을 때 전송됩니다.
 */
export function createPhaseUpdateNotificationGamePacket(
  phaseType: PhaseType,
  nextPhaseAt: string,
  characterPositions: CharacterPositionData[]
): GamePacket {
  return {
    payload: {
      oneofKind: GamePacketType.phaseUpdateNotification,
      phaseUpdateNotification: {
        phaseType,
        nextPhaseAt,
        characterPositions
      }
    }
  };
}

/**
 * 게임 종료 알림을 생성합니다.
 * 게임이 끝났을 때 승자와 승리 타입을 알려줍니다.
 */
export function createGameEndNotificationGamePacket(winners: string[], winType: WinType): GamePacket {
  return {
    payload: {
      oneofKind: GamePacketType.gameEndNotification,
      gameEndNotification: {
        winners,
        winType
      }
    }
  };
}

/**
 * 경고 알림을 생성합니다.
 * 폭탄 경고 등 특별한 상황을 알려줍니다.
 */
export function createWarningNotificationGamePacket(warningType: WarningType, expectedAt: string): GamePacket {
  return {
    payload: {
      oneofKind: GamePacketType.warningNotification,
      warningNotification: {
        warningType,
        expectedAt
      }
    }
  };
}

/**
 * 애니메이션 알림을 생성합니다.
 * 특별한 이펙트나 애니메이션을 재생할 때 사용됩니다.
 */
export function createAnimationNotificationGamePacket(
  userId: string, 
  animationType: AnimationType
): GamePacket {
  return {
    payload: {
      oneofKind: GamePacketType.animationNotification,
      animationNotification: {
        userId,
        animationType
      }
    }
  };
}
