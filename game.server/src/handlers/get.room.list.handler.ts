import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { sendData } from '../utils/send.data';
import { GlobalFailCode } from '../generated/common/enums';
import { GetRoomListUseCase } from '../useCase/room/get.room.list.usecase';
import { getRoomListResponseForm } from '../factory/packet.pactory';

/**
 * 방 목록 조회 핸들러입니다.
 * 클라이언트의 방 목록 조회 요청을 처리하고 GetRoomListUseCase를 통해 비즈니스 로직을 실행합니다.
 * 
 * 리팩토링된 구조에 따라:
 * - DTO 검증
 * - GetRoomListUseCase 호출
 * - 응답 패킷 전송
 */
const getRoomListHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
  if (!socket.userId) {
    console.log('[GetRoomListHandler] 사용자 ID가 없습니다.');
    return;
  }

  if (gamePacket.payload.oneofKind !== GamePacketType.getRoomListRequest) {
    console.log('[GetRoomListHandler] 잘못된 패킷 타입입니다.');
    return;
  }

  try {
    // 1. GetRoomListUseCase 호출
    const getRoomListUseCase = new GetRoomListUseCase();
    const result = await getRoomListUseCase.execute();

    // 2. 응답 패킷 전송
    const response = getRoomListResponseForm(result.roomList || []);
    sendData(socket, response, GamePacketType.getRoomListResponse);

    console.log(`[GetRoomListHandler] 방 목록 조회 처리 완료: success=${result.success}`);

  } catch (error) {
    console.error('[GetRoomListHandler] 방 목록 조회 처리 오류:', error);
    const response = getRoomListResponseForm([]);
    sendData(socket, response, GamePacketType.getRoomListResponse);
  }
};

export default getRoomListHandler;
