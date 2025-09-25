import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { sendData } from '../utils/send.data';
import { GlobalFailCode } from '../generated/common/enums';
import { LeaveRoomUseCase } from '../useCase/room/leave.room.usecase';
import { leaveRoomResponsePacketForm } from '../factory/packet.pactory';
import { GameSocket } from '../type/game.socket';
import { broadcastDataToRoom } from '../utils/notification.util';
import { getRoom } from '../utils/room.utils';

/**
 * 방 나가기 핸들러입니다.
 * 클라이언트의 방 나가기 요청을 처리하고 LeaveRoomUseCase를 통해 비즈니스 로직을 실행합니다.
 * 
 * 리팩토링된 구조에 따라:
 * - DTO 검증
 * - LeaveRoomUseCase 호출
 * - 응답 패킷 전송
 */
const leaveRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
  if (!socket.userId || !socket.roomId) {
    console.log('[LeaveRoomHandler] 사용자 ID 또는 방 ID가 없습니다.');
    return;
  }

  if (gamePacket.payload.oneofKind !== GamePacketType.leaveRoomRequest) {
    console.log('[LeaveRoomHandler] 잘못된 패킷 타입입니다.');
    return;
  }

  try {
    // 1. LeaveRoomUseCase 호출
    const leaveRoomUseCase = new LeaveRoomUseCase();
    const result = await leaveRoomUseCase.execute(Number(socket.userId), Number(socket.roomId));

    // 2. 응답 패킷 전송
    const response = leaveRoomResponsePacketForm({ success: result.success, failCode: result.failcode });
    sendData(socket, response, GamePacketType.leaveRoomResponse);

    // 3. 방 나가기 알림 브로드캐스트
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

    console.log(`[LeaveRoomHandler] 방 나가기 처리 완료: roomId=${socket.roomId}, success=${result.success}`);

  } catch (error) {
    console.error('[LeaveRoomHandler] 방 나가기 처리 오류:', error);
    const response = leaveRoomResponsePacketForm({ success: false, failCode: GlobalFailCode.UNKNOWN_ERROR });
    sendData(socket, response, GamePacketType.leaveRoomResponse);
  }
};

export default leaveRoomHandler;
