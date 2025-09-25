import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';

/**
 * 게임 시작 UseCase입니다.
 * 게임을 시작하고 초기 상태를 설정합니다.
 */
export class GameStartUseCase {
  /**
   * 게임 시작을 처리합니다.
   */
  async execute(
    userId: number,
    roomId: number
  ): Promise<{ success: boolean; failcode: GlobalFailCode; notificationGamePackets?: GamePacket[] }> {
    try {
      // 1. 입력 필드 검증
      if (!userId || !roomId) {
        return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
      }

      // TODO: 게임 시작 로직 구현 필요
      // - 방장 권한 확인
      // - 모든 사용자 준비 완료 확인
      // - 게임 상태 초기화
      // - 초기 카드 분배

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE,
        notificationGamePackets: [] // TODO: 실제 알림 패킷 생성
      };

    } catch (error) {
      console.error('[GameStartUseCase] 게임 시작 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }
}
