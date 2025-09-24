import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';

/**
 * 알림 전송을 담당하는 유틸리티입니다.
 * 모든 알림은 전체 방에 브로드캐스트됩니다.
 */

/**
 * 알림 게임 패킷들을 실제로 전송합니다.
 * 모든 알림은 전체 방에 브로드캐스트됩니다.
 */
export function sendNotificationGamePackets(
  roomId: number,
  notificationGamePackets: GamePacket[]
): void {
  if (!notificationGamePackets || notificationGamePackets.length === 0) {
    return;
  }

  notificationGamePackets.forEach(packet => {
    try {
      // 모든 알림을 전체 방에 브로드캐스트
      broadcastToRoom(roomId, packet);
    } catch (error) {
      console.error('[NotificationSender] 알림 전송 실패:', error);
    }
  });
}

/**
 * 전체 방에 알림을 브로드캐스트합니다.
 */
function broadcastToRoom(roomId: number, packet: GamePacket): void {
  // TODO: 기존 notification.util.ts의 broadcastDataToRoom 활용
  console.log('[NotificationSender] 방 전체 브로드캐스트:', roomId, packet.payload.oneofKind);
}
