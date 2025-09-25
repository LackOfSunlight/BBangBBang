import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { sendData } from '../utils/send.data';
import { GlobalFailCode } from '../generated/common/enums';
import { RegisterUseCase } from '../useCase/auth/register.usecase';
import { registerResponseForm } from '../factory/packet.pactory';

/**
 * 회원가입 핸들러입니다.
 * 클라이언트의 회원가입 요청을 처리하고 RegisterUseCase를 통해 비즈니스 로직을 실행합니다.
 * 
 * 리팩토링된 구조에 따라:
 * - DTO 검증
 * - RegisterUseCase 호출
 * - 응답 패킷 전송
 */
const registerHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
  if (gamePacket.payload.oneofKind !== GamePacketType.registerRequest) {
    console.log('[RegisterHandler] 잘못된 패킷 타입입니다.');
    return;
  }

  const req = gamePacket.payload.registerRequest;

  try {
    // 1. RegisterUseCase 호출
    const registerUseCase = new RegisterUseCase();
    const result = await registerUseCase.execute(req.email, req.nickname, req.password);

    // 2. 응답 패킷 전송
    const response = registerResponseForm(
      result.success, 
      result.success ? '회원가입 성공' : '회원가입 실패', 
      result.failcode
    );
    sendData(socket, response, GamePacketType.registerResponse);

    console.log(`[RegisterHandler] 회원가입 처리 완료: email=${req.email}, success=${result.success}`);

  } catch (error) {
    console.error('[RegisterHandler] 회원가입 처리 오류:', error);
    const response = registerResponseForm(false, '회원가입 실패', GlobalFailCode.UNKNOWN_ERROR);
    sendData(socket, response, GamePacketType.registerResponse);
  }
};

export default registerHandler;
