import { GamePacketType } from '../enums/gamePacketType';
import { GlobalFailCode } from '../generated/common/enums';
import { GamePacket } from '../generated/gamePacket';
import { GameSocket } from '../type/game.socket';
import { GameActionService } from '../services/game.action.service';
import { getGamePacketType } from '../utils/type.converter';
import { sendData } from '../utils/send.data';
import { broadcastDataToRoom } from '../utils/notification.util';
import { getRoom } from '../utils/room.utils';
import { reactionResponsePacketForm, userUpdateNotificationPacketForm } from '../factory/packet.pactory';
import { checkAndEndGameIfNeeded } from '../utils/game.end.util';

/**
 * 반응 핸들러입니다.
 * 클라이언트의 반응 요청을 처리하고 GameActionService를 통해 비즈니스 로직을 실행합니다.
 */
const reactionHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
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

  const payload = getGamePacketType(gamePacket, 'reactionRequest');
  if (!payload) {
    isInvalidRequest(socket, GlobalFailCode.INVALID_REQUEST);
    return;
  }

  const req = payload.reactionRequest;
  const reactionType = req.reactionType;

  // 2. GameActionService 호출
  const gameActionService = new GameActionService();
  const result = gameActionService.resolveReaction(userId, roomId, reactionType);

  // 3. 결과에 따라 응답/알림 전송
  const responsePacket = reactionResponsePacketForm(result.success, result.failcode);
  sendData(socket, responsePacket, GamePacketType.reactionResponse);

  // 4. 서비스에서 생성된 알림 패킷들 전송
  if (result.success && result.notificationGamePackets && result.notificationGamePackets.length > 0) {
    result.notificationGamePackets.forEach(packet => {
      if (packet.payload.oneofKind) {
        broadcastDataToRoom(room.users, packet, packet.payload.oneofKind as GamePacketType);
      }
    });
  }

  // 4. 게임 종료 조건 검사
  await checkAndEndGameIfNeeded(room.id);
};

/**
 * 잘못된 요청을 일괄 처리하기 위한 함수
 */
const isInvalidRequest = (socket: GameSocket, failcode: GlobalFailCode) => {
  const wrongDTO = reactionResponsePacketForm(false, failcode);
  sendData(socket, wrongDTO, GamePacketType.reactionResponse);
};

export default reactionHandler;
