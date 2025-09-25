import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { AuthService } from '../../services/auth.service';

/**
 * 로그인 UseCase입니다.
 * 사용자 인증을 처리합니다.
 */
export class LoginUseCase {
  /**
   * 사용자 로그인을 처리합니다.
   */
  async execute(
    email: string,
    password: string
  ): Promise<{ success: boolean; failcode: GlobalFailCode; userData?: any; token?: string }> {
    try {
      // 1. 입력 필드 검증
      if (!email || !password) {
        return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
      }

      // 2. 사용자 데이터 조회
      const authService = new AuthService();
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
      console.error('[LoginUseCase] 로그인 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }
}
