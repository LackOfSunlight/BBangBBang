import { GlobalFailCode } from '../../generated/common/enums';

/**
 * 방 목록 조회 UseCase입니다.
 * 대기 중인 방 목록을 조회합니다.
 */
export class GetRoomListUseCase {
  /**
   * 방 목록 조회를 처리합니다.
   */
  async execute(): Promise<{ success: boolean; failcode: GlobalFailCode; roomList?: any[] }> {
    try {
      const { prisma } = require('../../utils/db');
      
      // DB에서 방 목록 조회 (대기 중인 방만)
      const rooms = await prisma.room.findMany({
        where: {
          state: 'WAIT'
        },
        include: {
          owner: {
            select: {
              id: true,
              nickname: true
            }
          },
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // 방 데이터 변환 (사용자 수 포함)
      const roomList = rooms.map((room: any) => ({
        id: room.id,
        name: room.name,
        maxUserNum: room.maxUserNum,
        currentUserNum: room.users.length,
        owner: room.owner,
        state: room.state,
        createdAt: room.createdAt
      }));

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE,
        roomList: roomList
      };

    } catch (error) {
      console.error('[GetRoomListUseCase] 방 목록 조회 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }
}
