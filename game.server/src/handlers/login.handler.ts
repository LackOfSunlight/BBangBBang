import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { sendData } from '../utils/send.data';
import { GlobalFailCode } from '../generated/common/enums';
import { LoginUseCase } from '../useCase/auth/login.usecase';
import { loginResponseForm } from '../factory/packet.pactory';

/**
 * 로그인 핸들러입니다.
 * 클라이언트의 로그인 요청을 처리하고 LoginUseCase를 통해 비즈니스 로직을 실행합니다.
 * 
 * 리팩토링된 구조에 따라:
 * - DTO 검증
 * - LoginUseCase 호출
 * - 응답 패킷 전송
 */
const loginHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
  if (gamePacket.payload.oneofKind !== GamePacketType.loginRequest) {
    console.log('[LoginHandler] 잘못된 패킷 타입입니다.');
    return;
  }

  const req = gamePacket.payload.loginRequest;

  try {
    // 1. LoginUseCase 호출
    const loginUseCase = new LoginUseCase();
    const result = await loginUseCase.execute(req.email, req.password);

    // 2. 응답 패킷 전송
    const response = loginResponseForm(
      result.success, 
      result.success ? '로그인 성공' : '로그인 실패', 
      result.token || '', 
      result.failcode, 
      result.userData
    );
    sendData(socket, response, GamePacketType.loginResponse);

    console.log(`[LoginHandler] 로그인 처리 완료: email=${req.email}, success=${result.success}`);

  } catch (error) {
    console.error('[LoginHandler] 로그인 처리 오류:', error);
    const response = loginResponseForm(false, '로그인 실패', '', GlobalFailCode.UNKNOWN_ERROR);
    sendData(socket, response, GamePacketType.loginResponse);
  }
};

export default loginHandler;
