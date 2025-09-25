import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';

/**
 * 랜덤 방 참가 UseCase입니다.
 * 사용 가능한 랜덤 방에 참가시킵니다.
 */
export class JoinRandomRoomUseCase {
  /**
   * 랜덤 방 참가를 처리합니다.
   */
  async execute(
    userId: number
  ): Promise<{ success: boolean; failcode: GlobalFailCode; roomData?: any; notificationGamePackets?: GamePacket[] }> {
    try {
      // 1. 입력 필드 검증
      if (!userId) {
        return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
      }

      // TODO: 랜덤 방 참가 로직 구현 필요
      // - 사용 가능한 방 검색
      // - 랜덤 방 선택
      // - 방 참가 처리

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE,
        roomData: {
          id: Math.floor(Math.random() * 1000), // 임시 ID
          users: [] // 임시 빈 배열
        },
        notificationGamePackets: [] // TODO: 실제 알림 패킷 생성
      };

    } catch (error) {
      console.error('[JoinRandomRoomUseCase] 랜덤 방 참가 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }
}
