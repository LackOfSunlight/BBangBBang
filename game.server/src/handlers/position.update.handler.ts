import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { sendData } from '../utils/send.data';
import { GlobalFailCode } from '../generated/common/enums';
import { PositionUpdateUseCase } from '../useCase/game/position.update.usecase';
import { positionUpdateResponseForm } from '../factory/packet.pactory';

/**
 * 위치 업데이트 핸들러입니다.
 * 클라이언트의 위치 업데이트 요청을 처리하고 PositionUpdateUseCase를 통해 비즈니스 로직을 실행합니다.
 * 
 * 리팩토링된 구조에 따라:
 * - DTO 검증
 * - PositionUpdateUseCase 호출
 * - 응답 패킷 전송
 */
const positionUpdateHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
  if (!socket.userId || !socket.roomId) {
    console.log('[PositionUpdateHandler] 사용자 ID 또는 방 ID가 없습니다.');
    return;
  }

  if (gamePacket.payload.oneofKind !== GamePacketType.positionUpdateRequest) {
    console.log('[PositionUpdateHandler] 잘못된 패킷 타입입니다.');
    return;
  }

  const req = gamePacket.payload.positionUpdateRequest;

  try {
    // 1. PositionUpdateUseCase 호출
    const positionUpdateUseCase = new PositionUpdateUseCase();
    const result = await positionUpdateUseCase.execute(
      Number(socket.userId),
      Number(socket.roomId),
      req.x,
      req.y
    );

    // 2. 응답 패킷 전송 (위치 업데이트는 알림만 있음)
    // const response = positionUpdateResponseForm(result.success, result.failcode);
    // sendData(socket, response, GamePacketType.positionUpdateResponse);

    console.log(`[PositionUpdateHandler] 위치 업데이트 처리 완료: x=${req.x}, y=${req.y}, success=${result.success}`);

  } catch (error) {
    console.error('[PositionUpdateHandler] 위치 업데이트 처리 오류:', error);
    // 위치 업데이트는 응답이 없으므로 에러 로그만 출력
  }
};
export default positionUpdateHandler;
