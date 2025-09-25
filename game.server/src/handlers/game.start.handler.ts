import { GamePacketType } from '../enums/gamePacketType';
import { GamePacket } from '../generated/gamePacket';
import { GameSocket } from '../type/game.socket';
import { sendData } from '../utils/send.data';
import { GlobalFailCode } from '../generated/common/enums';
import { GameStartUseCase } from '../useCase/game/game.start.usecase';
import { gameStartResponsePacketForm } from '../factory/packet.pactory';
import { broadcastDataToRoom } from '../utils/notification.util';
import { getRoom } from '../utils/room.utils';

/**
 * 게임 시작 핸들러입니다.
 * 클라이언트의 게임 시작 요청을 처리하고 GameStartUseCase를 통해 비즈니스 로직을 실행합니다.
 * 
 * 리팩토링된 구조에 따라:
 * - DTO 검증
 * - GameStartUseCase 호출
 * - 응답 패킷 전송
 */
const gameStartHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
  if (!socket.userId || !socket.roomId) {
    console.log('[GameStartHandler] 사용자 ID 또는 방 ID가 없습니다.');
    return;
  }

  if (gamePacket.payload.oneofKind !== GamePacketType.gameStartRequest) {
    console.log('[GameStartHandler] 잘못된 패킷 타입입니다.');
    return;
  }

  try {
    // 1. GameStartUseCase 호출
    const gameStartUseCase = new GameStartUseCase();
    const result = await gameStartUseCase.execute(Number(socket.userId), Number(socket.roomId));

    // 2. 응답 패킷 전송
    const response = gameStartResponsePacketForm({ success: result.success, failCode: result.failcode });
    sendData(socket, response, GamePacketType.gameStartResponse);

    // 3. 게임 시작 알림 브로드캐스트
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

    console.log(`[GameStartHandler] 게임 시작 처리 완료: userId=${socket.userId}, success=${result.success}`);

  } catch (error) {
    console.error('[GameStartHandler] 게임 시작 처리 오류:', error);
    const response = gameStartResponsePacketForm({ success: false, failCode: GlobalFailCode.UNKNOWN_ERROR });
    sendData(socket, response, GamePacketType.gameStartResponse);
  }
};

export default gameStartHandler;
