import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { sendData } from '../utils/send.data';
import { GlobalFailCode } from '../generated/common/enums';
import { JoinRoomUseCase } from '../useCase/room/join.room.usecase';
import { joinRoomResponseForm } from '../factory/packet.pactory';
import { broadcastDataToRoom } from '../utils/notification.util';
import { getRoom } from '../utils/room.utils';

/**
 * 방 참가 핸들러입니다.
 * 클라이언트의 방 참가 요청을 처리하고 JoinRoomUseCase를 통해 비즈니스 로직을 실행합니다.
 * 
 * 리팩토링된 구조에 따라:
 * - DTO 검증
 * - JoinRoomUseCase 호출
 * - 응답 패킷 전송
 */
const joinRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
  if (!socket.userId) {
    console.log('[JoinRoomHandler] 사용자 ID가 없습니다.');
    return;
  }

  if (gamePacket.payload.oneofKind !== GamePacketType.joinRoomRequest) {
    console.log('[JoinRoomHandler] 잘못된 패킷 타입입니다.');
    return;
  }

  const req = gamePacket.payload.joinRoomRequest;

  try {
    // 1. JoinRoomUseCase 호출
    const joinRoomUseCase = new JoinRoomUseCase();
    const result = await joinRoomUseCase.execute(Number(socket.userId), req.roomId);

    // 2. 응답 패킷 전송
    const response = joinRoomResponseForm(result.success, result.failcode, result.roomData);
    sendData(socket, response, GamePacketType.joinRoomResponse);

    // 3. 방 참가 알림 브로드캐스트
    if (result.success && result.notificationGamePackets && result.notificationGamePackets.length > 0) {
      const room = getRoom(req.roomId);
      if (room) {
        result.notificationGamePackets.forEach(packet => {
          if (packet.payload.oneofKind) {
            broadcastDataToRoom(room.users, packet, packet.payload.oneofKind as GamePacketType);
          }
        });
      }
    }

    console.log(`[JoinRoomHandler] 방 참가 처리 완료: roomId=${req.roomId}, success=${result.success}`);

  } catch (error) {
    console.error('[JoinRoomHandler] 방 참가 처리 오류:', error);
    const response = joinRoomResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
    sendData(socket, response, GamePacketType.joinRoomResponse);
  }
};

export default joinRoomHandler;
