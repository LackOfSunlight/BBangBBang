import { GlobalFailCode, CharacterStateType } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { getRoom, getUserFromRoom } from '../../utils/room.utils';
import { fleaMarketNotificationForm, userUpdateNotificationPacketForm } from '../../factory/packet.pactory';

/**
 * 플리마켓 카드 선택 UseCase입니다.
 * 플리마켓에서 카드를 선택합니다.
 */
export class FleaMarketPickUseCase {
  /**
   * 플리마켓 카드 선택을 처리합니다.
   */
  execute(
    userId: string,
    roomId: number,
    pickIndex: number
  ): { success: boolean; failcode: GlobalFailCode; notificationGamePackets?: GamePacket[] } {
    try {
      // 1. 액터 로딩
      const room = getRoom(roomId);
      const user = getUserFromRoom(roomId, userId);

      // 2. 플리마켓 카드 검증
      const { cardManager } = require('../../managers/card.manager');
      const fleaMarketCards = cardManager.roomFleaMarketCards.get(roomId);
      const pickNumbers = cardManager.fleaMarketPickIndex.get(roomId);

      if (!fleaMarketCards || !pickNumbers) {
        return { success: false, failcode: GlobalFailCode.UNKNOWN_ERROR };
      }

      // 3. 카드 선택 처리
      const selectedCard = fleaMarketCards[pickIndex];
      pickNumbers.push(pickIndex);

      // 4. 사용자에게 카드 추가
      const existCard = user.character!.handCards.find((c) => c.type === selectedCard);
      if (existCard) {
        existCard.count += 1;
      } else {
        user.character!.handCards.push({ type: selectedCard, count: 1 });
      }
      user.character!.handCardsCount += 1;

      // 5. 상태 업데이트
      user.character!.stateInfo!.state = CharacterStateType.FLEA_MARKET_WAIT;
      user.character!.stateInfo!.nextState = CharacterStateType.NONE_CHARACTER_STATE;
      user.character!.stateInfo!.nextStateAt = '0';

      // 6. 다음 플레이어 턴 설정
      for (let i = 0; i < room.users.length; i++) {
        if (room.users[i].id === user.id) {
          const nextIndex = (i + 1) % room.users.length;
          const nextUser = room.users[nextIndex];

          if (nextUser.character?.stateInfo?.nextState !== CharacterStateType.NONE_CHARACTER_STATE) {
            nextUser.character!.stateInfo!.state = CharacterStateType.FLEA_MARKET_TURN;
            nextUser.character!.stateInfo!.nextState = CharacterStateType.FLEA_MARKET_WAIT;
            nextUser.character!.stateInfo!.nextStateAt = '5';
            break;
          }
        }
      }

      // 7. 모든 플레이어가 대기 상태인지 확인
      const allWaiting = room.users
        .filter((u) => u.character?.stateInfo?.state !== CharacterStateType.CONTAINED)
        .every((u) => u.character?.stateInfo?.state === CharacterStateType.FLEA_MARKET_WAIT);

      if (allWaiting) {
        // 모든 플레이어 상태 초기화
        for (const u of room.users) {
          if (u.character?.stateInfo?.state === CharacterStateType.CONTAINED) continue;

          u.character!.stateInfo!.state = CharacterStateType.NONE_CHARACTER_STATE;
          u.character!.stateInfo!.nextState = CharacterStateType.NONE_CHARACTER_STATE;
          u.character!.stateInfo!.nextStateAt = '0';
        }

        // 플리마켓 정리
        cardManager.fleaMarketPickIndex.set(roomId, []);
        cardManager.roomFleaMarketCards.set(roomId, []);
      }

      // 8. 알림 패킷 생성
      const fleaMarketGamePacket = fleaMarketNotificationForm(fleaMarketCards, pickNumbers);
      const userUpdateGamePacket = userUpdateNotificationPacketForm(room.users);

      return {
        success: true,
        failcode: GlobalFailCode.NONE_FAILCODE,
        notificationGamePackets: [fleaMarketGamePacket, userUpdateGamePacket]
      };

    } catch (error) {
      console.error('[FleaMarketPickUseCase] 플리마켓 카드 선택 실패:', error);
      return { success: false, failcode: GlobalFailCode.ROOM_NOT_FOUND };
    }
  }
}
