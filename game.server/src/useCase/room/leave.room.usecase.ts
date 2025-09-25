import { GlobalFailCode } from '../../generated/common/enums';
import { prisma } from '../../utils/db';
import { GamePacket } from '../../generated/gamePacket';

/**
 * 방 나가기 UseCase입니다.
 * 사용자를 방에서 제거합니다.
 */
export class LeaveRoomUseCase {
  /**
   * 방 나가기를 처리합니다.
   */
  async execute(
    userId: number,
    roomId: number
  ): Promise<{ success: boolean; failcode: GlobalFailCode; notificationGamePackets?: GamePacket[] }> {
    try {
      // 1. 입력 필드 검증
      if (!userId || !roomId) {
        return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
      }

      // prisma는 이미 import됨

      // 2. 사용자 방 참가 여부 확인
      const userData = await prisma.userData.findUnique({
        where: {
          userId_roomId: {
            userId: userId,
            roomId: roomId
          }
        }
      });

      if (!userData) {
        return { success: false, failcode: GlobalFailCode.LEAVE_ROOM_FAILED };
      }

      // 3. 방 정보 조회
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          users: true
        }
      });

      if (!room) {
        return { success: false, failcode: GlobalFailCode.ROOM_NOT_FOUND };
      }

      // 4. 사용자 방에서 제거
      await prisma.userData.delete({
        where: {
          userId_roomId: {
            userId: userId,
            roomId: roomId
          }
        }
      });

      // 5. 방장 변경 처리 (방장이 나가는 경우)
      if (room.ownerId === userId) {
        const remainingUsers = room.users.filter((ud: any) => ud.userId !== userId);
        
        if (remainingUsers.length > 0) {
          // 첫 번째 사용자를 새로운 방장으로 설정
          const newOwnerId = remainingUsers[0].userId;
          await prisma.room.update({
            where: { id: roomId },
            data: { ownerId: newOwnerId }
          });
        }
      }

      // 6. 방 삭제 처리 (마지막 사용자인 경우)
      const updatedRoom = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          users: true
        }
      });

      if (updatedRoom && updatedRoom.users.length === 0) {
        await prisma.room.delete({
          where: { id: roomId }
        });
      }

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE,
        notificationGamePackets: [] // TODO: 실제 알림 패킷 생성
      };

    } catch (error) {
      console.error('[LeaveRoomUseCase] 방 나가기 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }
}
