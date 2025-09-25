import { GlobalFailCode } from '../../generated/common/enums';

/**
 * 로그아웃 UseCase입니다.
 * 사용자 로그아웃을 처리합니다.
 */
export class LogoutUseCase {
  /**
   * 사용자 로그아웃을 처리합니다.
   */
  async execute(
    userId: number
  ): Promise<{ success: boolean; failcode: GlobalFailCode }> {
    try {
      // 1. 사용자 ID 검증
      if (!userId) {
        return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
      }

      // 2. 토큰 제거
      const { authService } = require('../../services/auth.service');
      const result = await authService.removeTokenUserDB(userId);
      
      if (!result.ok) {
        return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
      }

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE
      };

    } catch (error) {
      console.error('[LogoutUseCase] 로그아웃 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }
}
