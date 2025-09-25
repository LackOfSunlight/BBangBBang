import { GlobalFailCode } from '../../generated/common/enums';

/**
 * 디버프 넘기기 UseCase입니다.
 * 디버프를 다른 플레이어에게 전달합니다.
 */
export class PassDebuffUseCase {
  /**
   * 디버프 넘기기를 처리합니다.
   */
  async execute(
    userId: number,
    roomId: number,
    targetUserId: number,
    debuffCardType: number
  ): Promise<{ success: boolean; failcode: GlobalFailCode }> {
    try {
      // 1. 입력 필드 검증
      if (!userId || !roomId || !targetUserId || !debuffCardType) {
        return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
      }

      // TODO: 디버프 넘기기 로직 구현 필요
      // - 디버프 소지 여부 확인
      // - 대상자에게 디버프 전달
      // - 상태 업데이트

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE
      };

    } catch (error) {
      console.error('[PassDebuffUseCase] 디버프 넘기기 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }
}
