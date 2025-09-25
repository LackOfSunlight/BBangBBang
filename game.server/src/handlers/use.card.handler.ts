import { GamePacketType } from '../enums/gamePacketType';
import { CardType, GlobalFailCode } from '../generated/common/enums';
import { GamePacket } from '../generated/gamePacket';
import { GameSocket } from '../type/game.socket';
import { UseCardUseCase } from '../useCase/card/use.card.usecase';
import { getGamePacketType } from '../utils/type.converter';
import { sendData } from '../utils/send.data';
import { broadcastDataToRoom } from '../utils/notification.util';
import { getRoom } from '../utils/room.utils';
import { useCardResponsePacketForm, userUpdateNotificationPacketForm } from '../factory/packet.pactory';

/**
 * 카드 사용 핸들러입니다.
 * 클라이언트의 카드 사용 요청을 처리하고 UseCardUseCase를 통해 비즈니스 로직을 실행합니다.
 */
const useCardHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
  // 1. DTO 생성 및 기본 유효성 검사
  const { userId, roomId } = socket;
  if (!userId || !roomId) {
    // DTO가 유효하지 않으면 즉시 에러 응답
    isInvalidRequest(socket, GlobalFailCode.INVALID_REQUEST);
    return;
  }

  const room = getRoom(roomId);
  if (!room) {
    isInvalidRequest(socket, GlobalFailCode.ROOM_NOT_FOUND);
    return;
  }

  const payload = getGamePacketType(gamePacket, 'useCardRequest');
  if (!payload) {
    isInvalidRequest(socket, GlobalFailCode.INVALID_REQUEST);
    return;
  }

  const req = payload.useCardRequest;
  const cardType = req.cardType;
  const targetUserId = req.targetUserId;

  // 카드 타입 검증
  if (req.cardType === CardType.NONE) {
    console.warn(`[useCardHandler] 잘못된 카드 타입 요청: NONE`);
    isInvalidRequest(socket, GlobalFailCode.INVALID_REQUEST);
    return;
  }

  // 2. UseCardUseCase 호출
  const useCardUseCase = new UseCardUseCase();
  const result = useCardUseCase.execute(userId, roomId, cardType, targetUserId);

  // 3. 결과에 따라 응답/알림 전송
  const useCardResponsePacket = useCardResponsePacketForm(result.success, result.failcode);
  sendData(socket, useCardResponsePacket, GamePacketType.useCardResponse);

  // 4. UseCase에서 생성된 알림 패킷들 전송
  if (result.success && result.notificationGamePackets && result.notificationGamePackets.length > 0) {
    result.notificationGamePackets.forEach(packet => {
      if (packet.payload.oneofKind) {
        broadcastDataToRoom(room.users, packet, packet.payload.oneofKind as GamePacketType);
      }
    });
  }
};

/**
 * 잘못된 요청을 일괄 처리하기 위한 함수
 */
const isInvalidRequest = (socket: GameSocket, failcode: GlobalFailCode) => {
  const wrongDTO = useCardResponsePacketForm(false, failcode);
  sendData(socket, wrongDTO, GamePacketType.useCardResponse);
};

export default useCardHandler;
