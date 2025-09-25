import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { sendData } from '../utils/send.data';
import { GlobalFailCode } from '../generated/common/enums';
import { PassDebuffUseCase } from '../useCase/game/pass.debuff.usecase';
import { passDebuffResponseForm } from '../factory/packet.pactory';

/**
 * 디버프 넘기기 핸들러입니다.
 * 클라이언트의 디버프 넘기기 요청을 처리하고 PassDebuffUseCase를 통해 비즈니스 로직을 실행합니다.
 * 
 * 리팩토링된 구조에 따라:
 * - DTO 검증
 * - PassDebuffUseCase 호출
 * - 응답 패킷 전송
 */
const passDebuffHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
  if (!socket.userId || !socket.roomId) {
    console.log('[PassDebuffHandler] 사용자 ID 또는 방 ID가 없습니다.');
    return;
  }

  if (gamePacket.payload.oneofKind !== GamePacketType.passDebuffRequest) {
    console.log('[PassDebuffHandler] 잘못된 패킷 타입입니다.');
    return;
  }

  const req = gamePacket.payload.passDebuffRequest;

  try {
    // 1. PassDebuffUseCase 호출
    const passDebuffUseCase = new PassDebuffUseCase();
    const result = await passDebuffUseCase.execute(
      Number(socket.userId),
      Number(socket.roomId),
      Number(req.targetUserId),
      req.debuffCardType
    );

    // 2. 응답 패킷 전송
    const response = passDebuffResponseForm(result.success, result.failcode);
    sendData(socket, response, GamePacketType.passDebuffResponse);

    console.log(`[PassDebuffHandler] 디버프 넘기기 처리 완료: targetUserId=${req.targetUserId}, success=${result.success}`);

  } catch (error) {
    console.error('[PassDebuffHandler] 디버프 넘기기 처리 오류:', error);
    const response = passDebuffResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
    sendData(socket, response, GamePacketType.passDebuffResponse);
  }
};

export default passDebuffHandler;
