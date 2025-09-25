import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';

// 핸들러 임포트
import useCardHandler from '../handlers/use.card.handler';
import reactionHandler from '../handlers/reaction.handler';
import loginHandler from '../handlers/login.handler';
import registerHandler from '../handlers/register.handler';
import createRoomHandler from '../handlers/create.room.handler';
import getRoomListHandler from '../handlers/get.room.list.handler';
import joinRoomHandler from '../handlers/join.room.handler';
import joinRandomRoomHandler from '../handlers/join.random.room.handler';
import leaveRoomHandler from '../handlers/leave.room.handler';
import gamePrepareHandler from '../handlers/game.prepare.handler';
import gameStartHandler from '../handlers/game.start.handler';
import fleamarketPickHandler from '../handlers/fleamarket.pick.handler';
import destroyCardHandler from '../handlers/destroy.card.handler';
import cardSelectHandler from '../handlers/card.select.handler';
import passDebuffHandler from '../handlers/pass.debuff.handler';
import positionUpdateHandler from '../handlers/position.update.handler';

/**
 * 게임 패킷 디스패처입니다.
 * 클라이언트로부터 받은 패킷을 타입에 따라 적절한 핸들러로 라우팅합니다.
 * 
 * 리팩토링된 구조에 따라:
 * - 패킷 타입별 핸들러 매핑
 * - 핸들러 호출 및 에러 처리
 * - 일관된 패턴 적용
 */
const gamePacketDispatcher = (socket: GameSocket, gamePacket: GamePacket) => {
  try {
    // 패킷 타입별 핸들러 매핑
    const handlers = {
      // 카드 관련
      [GamePacketType.useCardRequest]: useCardHandler,
      [GamePacketType.reactionRequest]: reactionHandler,
      [GamePacketType.fleaMarketPickRequest]: fleamarketPickHandler,
      [GamePacketType.destroyCardRequest]: destroyCardHandler,
      [GamePacketType.cardSelectRequest]: cardSelectHandler,
      
      // 인증 관련
      [GamePacketType.loginRequest]: loginHandler,
      [GamePacketType.registerRequest]: registerHandler,
      
      // 방 관련
      [GamePacketType.createRoomRequest]: createRoomHandler,
      [GamePacketType.getRoomListRequest]: getRoomListHandler,
      [GamePacketType.joinRoomRequest]: joinRoomHandler,
      [GamePacketType.joinRandomRoomRequest]: joinRandomRoomHandler,
      [GamePacketType.leaveRoomRequest]: leaveRoomHandler,
      
      // 게임 관련
      [GamePacketType.gamePrepareRequest]: gamePrepareHandler,
      [GamePacketType.gameStartRequest]: gameStartHandler,
      
      // 기타
      [GamePacketType.passDebuffRequest]: passDebuffHandler,
      [GamePacketType.positionUpdateRequest]: positionUpdateHandler,
    };

    // 패킷 타입 확인
    const packetType = gamePacket.payload.oneofKind;
    if (!packetType) {
      console.warn('[GamePacketDispatcher] 패킷 타입이 없습니다.');
      return;
    }

    // 핸들러 찾기
    const handler = handlers[packetType as keyof typeof handlers];
    if (!handler) {
      console.warn(`[GamePacketDispatcher] 지원하지 않는 패킷 타입: ${packetType}`);
      return;
    }

    // 핸들러 실행
    console.log(`[GamePacketDispatcher] 패킷 처리 시작: ${packetType}`);
    handler(socket, gamePacket);
    console.log(`[GamePacketDispatcher] 패킷 처리 완료: ${packetType}`);

  } catch (error) {
    console.error('[GamePacketDispatcher] 패킷 처리 중 오류:', error);
  }
};

export default gamePacketDispatcher;