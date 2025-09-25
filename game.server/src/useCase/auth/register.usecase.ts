import { GlobalFailCode } from '../../generated/common/enums';
import { AuthService } from '../../services/auth.service';

/**
 * 회원가입 UseCase입니다.
 * 사용자 등록을 처리합니다.
 */
export class RegisterUseCase {
  /**
   * 사용자 회원가입을 처리합니다.
   */
  async execute(
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
      const authService = new AuthService();
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
      console.error('[RegisterUseCase] 회원가입 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }
}
