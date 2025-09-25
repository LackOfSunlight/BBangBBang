import { GlobalFailCode } from '../../generated/common/enums';
import { CardData } from '../../generated/common/types';
import { GamePacket } from '../../generated/gamePacket';
import { getRoom, getUserFromRoom } from '../../utils/room.utils';

/**
 * 카드 파괴 UseCase입니다.
 * 플레이어의 카드를 파괴합니다.
 */
export class DestroyCardUseCase {
  /**
   * 카드 파괴를 처리합니다.
   */
  execute(
    userId: string,
    roomId: number,
    destroyCards: CardData[]
  ): { success: boolean; failcode: GlobalFailCode; handCards?: CardData[]; notificationGamePackets?: GamePacket[] } {
    try {
      // 1. 액터 로딩
      const room = getRoom(roomId);
      const user = getUserFromRoom(roomId, userId);

      // 2. 카드 파괴 처리
      for (const destroyCard of destroyCards) {
        const handCard = user.character!.handCards.find(card => card.type === destroyCard.type);
        if (handCard) {
          handCard.count -= destroyCard.count;
          if (handCard.count <= 0) {
            user.character!.handCards = user.character!.handCards.filter(card => card !== handCard);
          }
        }
      }

      // 3. 핸드카드 개수 업데이트
      user.character!.handCardsCount = user.character!.handCards.reduce((sum, card) => sum + card.count, 0);

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE,
        handCards: user.character!.handCards,
        notificationGamePackets: [] // TODO: 실제 알림 패킷 생성
      };

    } catch (error) {
      console.error('[DestroyCardUseCase] 카드 파괴 실패:', error);
      return { success: false, failcode: GlobalFailCode.ROOM_NOT_FOUND };
    }
  }
}
