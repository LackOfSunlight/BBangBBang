import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { sendData } from '../utils/send.data';
import { GlobalFailCode } from '../generated/common/enums';
import { broadcastDataToRoom } from '../utils/notification.util';
import { fleaMarketResponseForm } from '../factory/packet.pactory';
import { FleaMarketPickUseCase } from '../useCase/card/fleamarket.pick.usecase';
import { getRoom } from '../utils/room.utils';

/**
 * 플리마켓 카드 선택 핸들러입니다.
 * 
 * 리팩토링된 구조에 따라:
 * - DTO 검증
 * - GameActionService 호출
 * - 응답 패킷 전송
 * - 알림 패킷 브로드캐스트
 */
const fleaMarketPickHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
  if (!socket.userId || !socket.roomId) {
    console.log('[FleaMarketPickHandler] 소켓과 패킷이 전달되지 않았습니다.');
    return;
  }

  if (gamePacket.payload.oneofKind !== GamePacketType.fleaMarketPickRequest) {
    console.log('[FleaMarketPickHandler] 잘못된 패킷 타입입니다.');
    return;
  }

  const req = gamePacket.payload.fleaMarketPickRequest;

  try {
    // 1. FleaMarketPickUseCase 호출
    const fleaMarketPickUseCase = new FleaMarketPickUseCase();
    const result = fleaMarketPickUseCase.execute(
      socket.userId,
      Number(socket.roomId),
      req.pickIndex
    );

    // 2. 응답 패킷 전송
    const response = fleaMarketResponseForm(result.success, result.failcode);
    sendData(socket, response, GamePacketType.fleaMarketPickResponse);

    // 3. 알림 패킷 브로드캐스트
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

  } catch (error) {
    console.error('[FleaMarketPickHandler] 처리 중 오류:', error);
    const response = fleaMarketResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
    sendData(socket, response, GamePacketType.fleaMarketPickResponse);
  }
};

export default fleaMarketPickHandler;
