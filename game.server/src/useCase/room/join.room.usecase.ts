import { GlobalFailCode } from '../../generated/common/enums';

/**
 * 방 참가 UseCase입니다.
 * 사용자를 특정 방에 참가시킵니다.
 */
export class JoinRoomUseCase {
  /**
   * 방 참가를 처리합니다.
   */
  async execute(
    userId: number,
    roomId: number
  ): Promise<{ success: boolean; failcode: GlobalFailCode; roomData?: any }> {
    try {
      // 1. 입력 필드 검증
      if (!userId || !roomId) {
        return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
      }

      const { prisma } = require('../../utils/db');

      // 2. 방 존재 여부 확인
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          users: true,
          owner: {
            select: {
              id: true,
              nickname: true
            }
          }
        }
      });

      if (!room) {
        return { success: false, failcode: GlobalFailCode.ROOM_NOT_FOUND };
      }

      // 3. 방 상태 확인 (대기 중인 방만 참가 가능)
      if (room.state !== 'WAIT') {
        return { success: false, failcode: GlobalFailCode.JOIN_ROOM_FAILED };
      }

      // 4. 방 정원 확인
      if (room.users.length >= room.maxUserNum) {
        return { success: false, failcode: GlobalFailCode.JOIN_ROOM_FAILED };
      }

      // 5. 이미 참가한 방인지 확인
      const existingUserData = await prisma.userData.findUnique({
        where: {
          userId_roomId: {
            userId: userId,
            roomId: roomId
          }
        }
      });

      if (existingUserData) {
        return { success: false, failcode: GlobalFailCode.JOIN_ROOM_FAILED };
      }

      // 6. 사용자 방 참가 처리
      await prisma.userData.create({
        data: {
          userId: userId,
          roomId: roomId
        }
      });

      // 7. 업데이트된 방 정보 조회
      const updatedRoom = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true
                }
              }
            }
          },
          owner: {
            select: {
              id: true,
              nickname: true
            }
          }
        }
      });

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE,
        roomData: {
          id: updatedRoom!.id,
          name: updatedRoom!.name,
          maxUserNum: updatedRoom!.maxUserNum,
          currentUserNum: updatedRoom!.users.length,
          state: updatedRoom!.state,
          owner: updatedRoom!.owner,
          users: updatedRoom!.users.map((ud: any) => ud.user)
        }
      };

    } catch (error) {
      console.error('[JoinRoomUseCase] 방 참가 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }
}
