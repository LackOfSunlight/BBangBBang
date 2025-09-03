// game.server/src/handlers/gamePacketHandler.ts
import { Socket } from "net";
import { GamePacket } from "../generated/gamePacket.js";
import { GamePacketType } from "../enums/gamePacketType.js";



export function handleGamePacket(socket: Socket, gamePacket: GamePacket) {
  const { payload } = gamePacket;

  if (!payload.oneofKind) {
    console.warn("Received packet with no oneofKind payload.");
    return;
  }

  switch (payload.oneofKind) {
    case GamePacketType.registerRequest:
      console.log("Register Request Received:");
      console.log("Email:", payload.registerRequest.email);
      console.log("Nickname:", payload.registerRequest.nickname);
      console.log("Password:", payload.registerRequest.password);
      // 여기에 회원가입 처리 로직 추가
      break;

    case GamePacketType.loginRequest:
      console.log("Login Request Received");
      // 여기에 로그인 처리 로직 추가
      break;

    case GamePacketType.createRoomRequest:
      console.log("Create Room Request Received");
      // 여기에 방 생성 처리 로직 추가
      break;

    case GamePacketType.getRoomListRequest:
      console.log("Get Room List Request Received");
      // 여기에 방 목록 조회 처리 로직 추가
      break;

    case GamePacketType.joinRoomRequest:
      console.log("Join Room Request Received");
      // 여기에 방 참가 처리 로직 추가
      break;

    case GamePacketType.joinRandomRoomRequest:
      console.log("Join Random Room Request Received");
      // 여기에 랜덤 방 참가 처리 로직 추가
      break;

    case GamePacketType.leaveRoomRequest:
      console.log("Leave Room Request Received");
      // 여기에 방 나가기 처리 로직 추가
      break;

    case GamePacketType.gamePrepareRequest:
      console.log("Game Prepare Request Received");
      // 여기에 게임 준비 처리 로직 추가
      break;

    case GamePacketType.gameStartRequest:
      console.log("Game Start Request Received");
      // 여기에 게임 시작 처리 로직 추가
      break;

    case GamePacketType.positionUpdateRequest:
      console.log("Position Update Request Received");
      // 여기에 위치 업데이트 처리 로직 추가
      break;

    case GamePacketType.useCardRequest:
      console.log("Use Card Request Received");
      // 여기에 카드 사용 처리 로직 추가
      break;

    case GamePacketType.fleaMarketPickRequest:
      console.log("Flea Market Pick Request Received");
      // 여기에 플리마켓 선택 처리 로직 추가
      break;

    case GamePacketType.reactionRequest:
      console.log("Reaction Request Received");
      // 여기에 리액션 처리 로직 추가
      break;

    case GamePacketType.destroyCardRequest:
      console.log("Destroy Card Request Received");
      // 여기에 카드 파기 처리 로직 추가
      break;

    case GamePacketType.cardSelectRequest:
      console.log("Card Select Request Received");
      // 여기에 카드 선택 처리 로직 추가
      break;

    case GamePacketType.passDebuffRequest:
      console.log("Pass Debuff Request Received");
      // 여기에 디버프 전달 처리 로직 추가
      break;

    default:
      // 요청(Request)이 아닌 패킷은 무시하거나 로깅할 수 있습니다.
      console.log(`Ignoring non-request packet: ${payload.oneofKind}`);
      break;
  }
}
