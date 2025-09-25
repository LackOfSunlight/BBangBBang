import { GlobalFailCode } from '../../generated/common/enums';

/**
 * 위치 업데이트 UseCase입니다.
 * 플레이어의 위치를 업데이트합니다.
 */
export class PositionUpdateUseCase {
  /**
   * 위치 업데이트를 처리합니다.
   */
  async execute(
    userId: number,
    roomId: number,
    x: number,
    y: number
  ): Promise<{ success: boolean; failcode: GlobalFailCode }> {
    try {
      // 1. 입력 필드 검증
      if (!userId || !roomId || x === undefined || y === undefined) {
        return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
      }

      // TODO: 위치 업데이트 로직 구현 필요
      // - 위치 유효성 검증
      // - 캐릭터 위치 업데이트
      // - 다른 플레이어들에게 알림

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE
      };

    } catch (error) {
      console.error('[PositionUpdateUseCase] 위치 업데이트 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }
}
