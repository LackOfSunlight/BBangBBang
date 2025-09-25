import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { sendData } from '../utils/send.data';
import { GlobalFailCode } from '../generated/common/enums';
import { cardSelectResponseForm } from '../factory/packet.pactory';
import { CardSelectUseCase } from '../useCase/card/card.select.usecase';
import { broadcastDataToRoom } from '../utils/notification.util';
import { getRoom } from '../utils/room.utils';

/**
 * 카드 선택 핸들러입니다.
 * 플레이어가 카드를 선택하는 기능을 처리합니다.
 * 
 * 리팩토링된 구조에 따라:
 * - DTO 검증
 * - GameActionService 호출
 * - 응답 패킷 전송
 */
const cardSelectHandler = (socket: GameSocket, gamePacket: GamePacket) => {
  if (!socket.userId || !socket.roomId) {
    console.log('[CardSelectHandler] 소켓과 패킷이 전달되지 않았습니다.');
    return;
  }

  if (gamePacket.payload.oneofKind !== GamePacketType.cardSelectRequest) {
    console.log('[CardSelectHandler] 잘못된 패킷 타입입니다.');
    return;
  }

  const req = gamePacket.payload.cardSelectRequest;

  try {
    // 1. CardSelectUseCase 호출
    const cardSelectUseCase = new CardSelectUseCase();
    const result = cardSelectUseCase.execute(
      socket.userId,
      Number(socket.roomId),
      req.selectType,
      req.selectCardType
    );

    // 2. 응답 패킷 전송
    const response = cardSelectResponseForm(result.success, result.failcode);
    sendData(socket, response, GamePacketType.cardSelectResponse);

    // 3. 카드 선택 알림 브로드캐스트
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

    console.log(`[CardSelectHandler] 카드 선택 완료: userId=${socket.userId}, selectType=${req.selectType}, cardType=${req.selectCardType}`);

  } catch (error) {
    console.error('[CardSelectHandler] 처리 중 오류:', error);
    const response = cardSelectResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
    sendData(socket, response, GamePacketType.cardSelectResponse);
  }
};

export default cardSelectHandler;