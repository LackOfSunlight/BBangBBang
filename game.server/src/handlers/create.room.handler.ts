import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { sendData } from '../utils/send.data';
import { GlobalFailCode } from '../generated/common/enums';
import { CreateRoomUseCase } from '../useCase/room/create.room.usecase';
import { createRoomResponseForm } from '../factory/packet.pactory';

/**
 * 방 생성 핸들러입니다.
 * 클라이언트의 방 생성 요청을 처리하고 CreateRoomUseCase를 통해 비즈니스 로직을 실행합니다.
 * 
 * 리팩토링된 구조에 따라:
 * - DTO 검증
 * - CreateRoomUseCase 호출
 * - 응답 패킷 전송
 */
const createRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
  if (!socket.userId) {
    console.log('[CreateRoomHandler] 사용자 ID가 없습니다.');
    return;
  }

  if (gamePacket.payload.oneofKind !== GamePacketType.createRoomRequest) {
    console.log('[CreateRoomHandler] 잘못된 패킷 타입입니다.');
    return;
  }

  const req = gamePacket.payload.createRoomRequest;

  try {
    // 1. CreateRoomUseCase 호출
    const createRoomUseCase = new CreateRoomUseCase();
    const result = await createRoomUseCase.execute(
      Number(socket.userId),
      req.name,
      req.maxUserNum
    );

    // 2. 응답 패킷 전송
    const response = createRoomResponseForm(result.success, result.failcode, result.roomData);
    sendData(socket, response, GamePacketType.createRoomResponse);

    console.log(`[CreateRoomHandler] 방 생성 처리 완료: name=${req.name}, success=${result.success}`);

  } catch (error) {
    console.error('[CreateRoomHandler] 방 생성 처리 오류:', error);
    const response = createRoomResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
    sendData(socket, response, GamePacketType.createRoomResponse);
  }
};

export default createRoomHandler;
