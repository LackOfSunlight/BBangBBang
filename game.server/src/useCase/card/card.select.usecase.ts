import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { getRoom, getUserFromRoom } from '../../utils/room.utils';

/**
 * 카드 선택 UseCase입니다.
 * 특정 카드를 선택합니다.
 */
export class CardSelectUseCase {
  /**
   * 카드 선택을 처리합니다.
   */
  execute(
    userId: string,
    roomId: number,
    selectType: number,
    selectCardType: number
  ): { success: boolean; failcode: GlobalFailCode; notificationGamePackets?: GamePacket[] } {
    try {
      // 1. 액터 로딩
      const room = getRoom(roomId);
      const user = getUserFromRoom(roomId, userId);

      // TODO: 카드 선택 로직 구현 필요
      // - selectType에 따른 카드 검증
      // - selectCardType이 유효한지 확인
      // - 선택 가능한 상태인지 확인

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE,
        notificationGamePackets: [] // TODO: 실제 알림 패킷 생성
      };

    } catch (error) {
      console.error('[CardSelectUseCase] 카드 선택 실패:', error);
      return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
    }
  }
}
