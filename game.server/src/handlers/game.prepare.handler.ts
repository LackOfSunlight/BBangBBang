import { GamePacketType } from '../enums/gamePacketType';
import { GamePacket } from '../generated/gamePacket';
import { GameSocket } from '../type/game.socket';
import { sendData } from '../utils/send.data';
import { GlobalFailCode } from '../generated/common/enums';
import { GamePrepareUseCase } from '../useCase/game/game.prepare.usecase';
import { gamePrepareResponsePacketForm } from '../factory/packet.pactory';
import { broadcastDataToRoom } from '../utils/notification.util';
import { getRoom } from '../utils/room.utils';

/**
 * 게임 준비 핸들러입니다.
 * 클라이언트의 게임 준비 요청을 처리하고 GamePrepareUseCase를 통해 비즈니스 로직을 실행합니다.
 * 
 * 리팩토링된 구조에 따라:
 * - DTO 검증
 * - GamePrepareUseCase 호출
 * - 응답 패킷 전송
 */
const gamePrepareHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
  if (!socket.userId || !socket.roomId) {
    console.log('[GamePrepareHandler] 사용자 ID 또는 방 ID가 없습니다.');
    return;
  }

  if (gamePacket.payload.oneofKind !== GamePacketType.gamePrepareRequest) {
    console.log('[GamePrepareHandler] 잘못된 패킷 타입입니다.');
    return;
  }

  try {
    // 1. GamePrepareUseCase 호출
    const gamePrepareUseCase = new GamePrepareUseCase();
    const result = await gamePrepareUseCase.execute(Number(socket.userId), Number(socket.roomId));

    // 2. 응답 패킷 전송
    const response = gamePrepareResponsePacketForm({ success: result.success, failCode: result.failcode });
    sendData(socket, response, GamePacketType.gamePrepareResponse);

    // 3. 게임 준비 알림 브로드캐스트
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

    console.log(`[GamePrepareHandler] 게임 준비 처리 완료: userId=${socket.userId}, success=${result.success}`);

  } catch (error) {
    console.error('[GamePrepareHandler] 게임 준비 처리 오류:', error);
    const response = gamePrepareResponsePacketForm({ success: false, failCode: GlobalFailCode.UNKNOWN_ERROR });
    sendData(socket, response, GamePacketType.gamePrepareResponse);
  }
};

export default gamePrepareHandler;
