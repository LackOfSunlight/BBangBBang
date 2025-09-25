import { GlobalFailCode } from '../../generated/common/enums';

/**
 * 방 생성 UseCase입니다.
 * 새로운 게임 방을 생성합니다.
 */
export class CreateRoomUseCase {
  /**
   * 방 생성을 처리합니다.
   */
  async execute(
    userId: number,
    roomName: string,
    maxUserNum: number
  ): Promise<{ success: boolean; failcode: GlobalFailCode; roomData?: any }> {
    try {
      // 1. 입력 필드 검증
      if (!userId || !roomName || !maxUserNum) {
        return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
      }

      // 2. 중복 방 이름 검증
      const { prisma } = require('../../utils/db');
      const existingRoom = await prisma.room.findFirst({
        where: { name: roomName }
      });

      if (existingRoom) {
        return { success: false, failcode: GlobalFailCode.CREATE_ROOM_FAILED };
      }

      // 3. 방 생성 및 DB 저장
      const newRoom = await prisma.room.create({
        data: {
          ownerId: userId,
          name: roomName,
          maxUserNum: maxUserNum,
          state: 'WAIT'
        },
        include: {
          owner: {
            select: {
              id: true,
              nickname: true,
              email: true
            }
          }
        }
      });

      // 4. 방장을 방에 추가
      await prisma.userData.create({
        data: {
          userId: userId,
          roomId: newRoom.id
        }
      });

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE,
        roomData: {
          id: newRoom.id,
          name: newRoom.name,
          maxUserNum: newRoom.maxUserNum,
          ownerId: newRoom.ownerId,
          state: newRoom.state,
          owner: newRoom.owner
        }
      };

    } catch (error) {
      console.error('[CreateRoomUseCase] 방 생성 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }
}
