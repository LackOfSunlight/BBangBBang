import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { sendData } from '../utils/send.data';
import { GlobalFailCode } from '../generated/common/enums';
import { JoinRandomRoomUseCase } from '../useCase/room/join.random.room.usecase';
import { joinRandomRoomResponseForm } from '../factory/packet.pactory';
import { broadcastDataToRoom } from '../utils/notification.util';
import { getRoom } from '../utils/room.utils';

/**
 * 랜덤 방 참가 핸들러입니다.
 * 클라이언트의 랜덤 방 참가 요청을 처리하고 JoinRandomRoomUseCase를 통해 비즈니스 로직을 실행합니다.
 * 
 * 리팩토링된 구조에 따라:
 * - DTO 검증
 * - JoinRandomRoomUseCase 호출
 * - 응답 패킷 전송
 */
const joinRandomRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
  if (!socket.userId) {
    console.log('[JoinRandomRoomHandler] 사용자 ID가 없습니다.');
    return;
  }

  if (gamePacket.payload.oneofKind !== GamePacketType.joinRandomRoomRequest) {
    console.log('[JoinRandomRoomHandler] 잘못된 패킷 타입입니다.');
    return;
  }

  try {
    // 1. JoinRandomRoomUseCase 호출
    const joinRandomRoomUseCase = new JoinRandomRoomUseCase();
    const result = await joinRandomRoomUseCase.execute(Number(socket.userId));

    // 2. 응답 패킷 전송
    const response = joinRandomRoomResponseForm(result.success, result.failcode, result.roomData);
    sendData(socket, response, GamePacketType.joinRandomRoomResponse);

    // 3. 랜덤 방 참가 알림 브로드캐스트
    if (result.success && result.notificationGamePackets && result.notificationGamePackets.length > 0) {
      const room = getRoom(result.roomData?.id);
      if (room) {
        result.notificationGamePackets.forEach(packet => {
          if (packet.payload.oneofKind) {
            broadcastDataToRoom(room.users, packet, packet.payload.oneofKind as GamePacketType);
          }
        });
      }
    }

    console.log(`[JoinRandomRoomHandler] 랜덤 방 참가 처리 완료: success=${result.success}`);

  } catch (error) {
    console.error('[JoinRandomRoomHandler] 랜덤 방 참가 처리 오류:', error);
    const response = joinRandomRoomResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
    sendData(socket, response, GamePacketType.joinRandomRoomResponse);
  }
};

export default joinRandomRoomHandler;
