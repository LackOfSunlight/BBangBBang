import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { sendData } from '../utils/send.data';
import { GlobalFailCode } from '../generated/common/enums';
import { destroyResponseForm } from '../factory/packet.pactory';
import { DestroyCardUseCase } from '../useCase/card/destroy.card.usecase';
import { broadcastDataToRoom } from '../utils/notification.util';
import { getRoom } from '../utils/room.utils';

/**
 * 카드 파괴 핸들러입니다.
 * 턴 종료 시 (phaseType 3) 카드를 버리는 기능을 처리합니다.
 * 
 * 리팩토링된 구조에 따라:
 * - DTO 검증
 * - GameActionService 호출
 * - 응답 패킷 전송
 */
const destroyCardHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
  if (!socket.userId || !socket.roomId) {
    console.log('[DestroyCardHandler] 소켓과 패킷이 전달되지 않았습니다.');
    return;
  }

  if (gamePacket.payload.oneofKind !== GamePacketType.destroyCardRequest) {
    console.log('[DestroyCardHandler] 잘못된 패킷 타입입니다.');
    return;
  }

  const req = gamePacket.payload.destroyCardRequest;

  try {
    // 1. DestroyCardUseCase 호출
    const destroyCardUseCase = new DestroyCardUseCase();
    const result = destroyCardUseCase.execute(
      socket.userId,
      Number(socket.roomId),
      req.destroyCards
    );

    // 2. 응답 패킷 전송
    if (result.success && result.handCards) {
      const response = destroyResponseForm(result.handCards);
      sendData(socket, response, GamePacketType.destroyCardResponse);
    } else {
      // TODO: 에러 응답 패킷 생성 필요
      console.error('[DestroyCardHandler] 카드 파괴 실패:', result.failcode);
    }

    // 3. 카드 파괴 알림 브로드캐스트
    if (result.success && result.notificationGamePackets && result.notificationGamePackets.length > 0) {
      const room = getRoom(Number(socket.roomId));
      if (room) {
        result.notificationGamePackets.forEach(packet => {
          if (packet.payload.oneofKind) {
            broadcastDataToRoom(room.users, packet, packet.payload.oneofKind as GamePacketType);
          }
        });
      }
    }

    console.log(`[DestroyCardHandler] 카드 파괴 완료: userId=${socket.userId}, destroyed=${req.destroyCards.length}장`);

  } catch (error) {
    console.error('[DestroyCardHandler] 처리 중 오류:', error);
    // TODO: 에러 응답 패킷 생성 필요
  }
};

export default destroyCardHandler;