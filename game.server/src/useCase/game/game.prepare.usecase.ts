import { GlobalFailCode } from '../../generated/common/enums';

/**
 * 게임 준비 UseCase입니다.
 * 게임 시작 전 준비 상태를 처리합니다.
 */
export class GamePrepareUseCase {
  /**
   * 게임 준비를 처리합니다.
   */
  async execute(
    userId: number,
    roomId: number
  ): Promise<{ success: boolean; failcode: GlobalFailCode }> {
    try {
      // 1. 입력 필드 검증
      if (!userId || !roomId) {
        return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
      }

      // TODO: 게임 준비 로직 구현 필요
      // - 사용자 준비 상태 설정
      // - 모든 사용자 준비 완료 확인
      // - 게임 시작 가능 여부 검증

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE
      };

    } catch (error) {
      console.error('[GamePrepareUseCase] 게임 준비 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }
}
