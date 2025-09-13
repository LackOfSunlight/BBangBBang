/**
 * E2E 테스트용 모의 게임 서버
 * 
 * 이 파일은 현피 E2E 테스트에서 실제 서버를 시뮬레이션하기 위한
 * 모의 서버를 제공합니다.
 * 
 * 주요 기능:
 * - TCP 소켓 서버 역할
 * - 현피 카드 사용부터 최종 승부까지 전체 플로우 시뮬레이션
 * - 실제 프로젝트의 패킷 구조와 동일한 응답
 * - 게임 상태 관리 및 턴 교대 로직
 */

import net, { Server } from 'net';
import { GamePacket } from '../../generated/gamePacket.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { CharacterStateType, CardType } from '../../generated/common/enums.js';
import { createPacketDecoder, encodePacket, GameState } from './tcp.test.utils.js';

/**
 * 테스트용 플레이어 타입 정보
 */
type TestPlayer = {
  id: string;
  nickname: string;
  socket: net.Socket;
  roomId: number;
  isConnected: boolean;
};

/**
 * 모의 게임 서버 클래스
 * - 실제 서버의 핵심 로직을 시뮬레이션
 * - 현피 카드 사용, 상태 변경, 턴 교대 등을 처리
 */
export class MockGameServer {
  private server: Server | null = null;
  private players: Map<string, TestPlayer> = new Map();
  private gameStates: Map<number, GameState> = new Map();
  private currentRoomId = 1;

  constructor(private port: number) {}

  /**
   * 모의 서버 시작
   */
  async start(): Promise<void> {
    this.server = net.createServer((socket) => this.handleConnection(socket));
    
    return new Promise<void>((resolve, reject) => {
      this.server!.listen(this.port, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`[MockGameServer] TCP 서버 실행 중 : 포트 ${this.port}`);
          resolve();
        }
      });
    });
  }

  /**
   * 모의 서버 종료
   */
  async stop(): Promise<void> {
    return new Promise<void>((resolve) => {
      // 모든 플레이어 연결 종료
      this.players.forEach(player => {
        if (player.socket && !player.socket.destroyed) {
          player.socket.destroy();
        }
      });
      this.players.clear();
      this.gameStates.clear();

      // 서버 종료
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * 클라이언트 연결 처리
   */
  private handleConnection(socket: net.Socket) {
    const playerId = `player${this.players.size + 1}`;
    const player: TestPlayer = {
      id: playerId,
      nickname: `테스트플레이어${this.players.size + 1}`,
      socket,
      roomId: this.currentRoomId,
      isConnected: true
    };

    this.players.set(playerId, player);
    console.log(`[MockGameServer] 플레이어 연결: ${playerId}`);

    // 초기 게임 상태 생성
    if (!this.gameStates.has(this.currentRoomId)) {
      this.gameStates.set(this.currentRoomId, {
        roomId: this.currentRoomId,
        players: [
          {
            id: 'player1',
            nickname: '테스트플레이어1',
            hp: 4,
            state: 0, // NONE_CHARACTER_STATE = 0
            handCards: [
              { type: 1, count: 2 }, // BBANG 카드
              { type: 6, count: 1 }  // DEATH_MATCH 카드
            ]
          },
          {
            id: 'player2',
            nickname: '테스트플레이어2',
            hp: 4,
            state: 0, // NONE_CHARACTER_STATE = 0
            handCards: [
              { type: 1, count: 1 }, // BBANG 카드
              { type: 3, count: 1 }  // SHIELD 카드
            ]
          }
        ],
        currentTurn: null,
        deathMatchActive: false,
        deathMatchAttacker: null,
        deathMatchDefender: null
      });
    }

    // 패킷 수신 처리
    socket.on('data', createPacketDecoder(
      (packet) => this.handlePacket(player, packet),
      (error) => console.error(`[MockGameServer] 패킷 처리 오류:`, error)
    ));

    socket.on('close', () => {
      // 테스트 중이 아닐 때만 로그 출력 (Jest 테스트 종료 후 로그 방지)
      if (process.env.NODE_ENV !== 'test' || process.env.JEST_WORKER_ID) {
        console.log(`[MockGameServer] 플레이어 연결 종료: ${playerId}`);
      }
      player.isConnected = false;
      this.players.delete(playerId);
    });

    socket.on('error', (error) => {
      console.error(`[MockGameServer] 소켓 오류:`, error);
    });
  }

  /**
   * 패킷 처리 메인 로직
   */
  private handlePacket(player: TestPlayer, packet: GamePacket) {
    console.log(`[MockGameServer] 패킷 수신: ${player.id}`, packet);

    try {
      switch (packet.payload?.oneofKind) {
        case GamePacketType.loginRequest:
          this.handleLoginRequest(player, packet);
          break;
        case GamePacketType.joinRoomRequest:
          this.handleJoinRoomRequest(player, packet);
          break;
        case GamePacketType.useCardRequest:
          this.handleUseCardRequest(player, packet);
          break;
        case GamePacketType.reactionRequest:
          this.handleReactionRequest(player, packet);
          break;
        default:
          console.log(`[MockGameServer] 알 수 없는 패킷 타입: ${packet.payload?.oneofKind}`);
      }
    } catch (error) {
      console.error(`[MockGameServer] 패킷 처리 중 오류:`, error);
    }
  }

  /**
   * 로그인 요청 처리
   */
  private handleLoginRequest(player: TestPlayer, packet: GamePacket) {
    console.log(`[MockGameServer] 로그인 요청: ${player.id}`);
    
    // 로그인 성공 응답
    const response: GamePacket = {
      payload: {
        oneofKind: GamePacketType.loginResponse,
        loginResponse: {
          success: true,
          message: '로그인 성공',
          token: 'mock-token-' + player.id,
          failCode: 0
        }
      }
    };
    
    this.sendToPlayer(player, response);
  }

  /**
   * 방 참가 요청 처리
   */
  private handleJoinRoomRequest(player: TestPlayer, packet: GamePacket) {
    console.log(`[MockGameServer] 방 참가 요청: ${player.id}`);
    
    // 방 참가 성공 응답
    const response: GamePacket = {
      payload: {
        oneofKind: GamePacketType.joinRoomResponse,
        joinRoomResponse: {
          success: true,
          failCode: 0
        }
      }
    };
    
    this.sendToPlayer(player, response);
    
    // 게임 상태 업데이트 알림 전송
    this.sendGameStateUpdate(player.roomId);
  }

  /**
   * 카드 사용 요청 처리
   */
  private handleUseCardRequest(player: TestPlayer, packet: GamePacket) {
    if (packet.payload?.oneofKind !== GamePacketType.useCardRequest) return;
    const request = packet.payload.useCardRequest;
    if (!request) return;

    console.log(`[MockGameServer] 카드 사용 요청: ${player.id}, 카드타입: ${request.cardType}, 타겟: ${request.targetUserId}`);

    const gameState = this.gameStates.get(player.roomId);
    if (!gameState) return;

    // 현피 카드 사용 처리
    if (request.cardType === CardType.DEATH_MATCH) {
      this.handleDeathMatchCard(player, request.targetUserId, gameState);
    }
    // 빵야 카드 사용 처리
    else if (request.cardType === CardType.BBANG) {
      this.handleBbangCard(player, request.targetUserId, gameState);
    }

    // 카드 사용 성공 응답
    const response: GamePacket = {
      payload: {
        oneofKind: GamePacketType.useCardResponse,
        useCardResponse: {
          success: true,
          failCode: 0
        }
      }
    };
    
    this.sendToPlayer(player, response);
    
    // 게임 상태 업데이트 알림 전송
    this.sendGameStateUpdate(player.roomId);
  }

  /**
   * 반응 요청 처리 (현피 중 패스 등)
   */
  private handleReactionRequest(player: TestPlayer, packet: GamePacket) {
    if (packet.payload?.oneofKind !== GamePacketType.reactionRequest) return;
    const request = packet.payload.reactionRequest;
    if (!request) return;

    console.log(`[MockGameServer] 반응 요청: ${player.id}, 반응타입: ${request.reactionType}`);

    const gameState = this.gameStates.get(player.roomId);
    if (!gameState) return;

    // 현피 중 패스 처리
    if (gameState.deathMatchActive) {
      this.handleDeathMatchPass(player, gameState);
    }

    // 반응 성공 응답
    const response: GamePacket = {
      payload: {
        oneofKind: GamePacketType.reactionResponse,
        reactionResponse: {
          success: true,
          failCode: 0
        }
      }
    };
    
    this.sendToPlayer(player, response);
    
    // 게임 상태 업데이트 알림 전송
    this.sendGameStateUpdate(player.roomId);
  }

  /**
   * 현피 카드 사용 처리
   */
  private handleDeathMatchCard(player: TestPlayer, targetUserId: string, gameState: GameState) {
    // string을 player 형식으로 변환 (2 -> player2)
    const targetUserIdStr = `player${targetUserId}`;
    console.log(`[MockGameServer] 현피 카드 사용: ${player.id} -> ${targetUserIdStr}`);
    
    // 현피 상태 설정
    gameState.deathMatchActive = true;
    gameState.deathMatchAttacker = player.id;
    gameState.deathMatchDefender = targetUserIdStr;
    
    // 플레이어 상태 변경
    const attacker = gameState.players.find(p => p.id === player.id);
    const defender = gameState.players.find(p => p.id === targetUserIdStr);
    
    if (attacker) {
      attacker.state = 3; // DEATH_MATCH_STATE = 3 (공격자는 대기 상태)
    }
    if (defender) {
      defender.state = 4; // DEATH_MATCH_TURN_STATE = 4 (방어자가 먼저 턴)
    }
    
    console.log(`[MockGameServer] 현피 시작: ${player.id} vs ${targetUserIdStr}`);
  }

  /**
   * 빵야 카드 사용 처리
   */
  private handleBbangCard(player: TestPlayer, targetUserId: string, gameState: GameState) {
    // string을 player 형식으로 변환 (2 -> player2)
    const targetUserIdStr = `player${targetUserId}`;
    console.log(`[MockGameServer] 빵야 카드 사용: ${player.id} -> ${targetUserIdStr}`);
    
    // 현피 중이면 턴 교대
    if (gameState.deathMatchActive) {
      this.switchDeathMatchTurn(gameState);
    }
  }

  /**
   * 현피 중 패스 처리
   */
  private handleDeathMatchPass(player: TestPlayer, gameState: GameState) {
    console.log(`[MockGameServer] 현피 패스: ${player.id}`);
    
    // 패스한 플레이어 HP 감소
    const playerData = gameState.players.find(p => p.id === player.id);
    if (playerData) {
      playerData.hp = Math.max(0, playerData.hp - 1);
      console.log(`[MockGameServer] ${player.id} HP 감소: ${playerData.hp + 1} -> ${playerData.hp}`);
    }
    
    // 현피 종료
    this.endDeathMatch(gameState);
    
    // 게임 상태 업데이트 알림 전송
    this.sendGameStateUpdate(player.roomId);
  }

  /**
   * 현피 턴 교대
   */
  private switchDeathMatchTurn(gameState: GameState) {
    if (!gameState.deathMatchActive) return;
    
    const attacker = gameState.players.find(p => p.id === gameState.deathMatchAttacker);
    const defender = gameState.players.find(p => p.id === gameState.deathMatchDefender);
    
    if (attacker && defender) {
      // 턴 교대: 현재 턴을 가진 플레이어와 대기 중인 플레이어를 바꿈
      if (attacker.state === 4) { // DEATH_MATCH_TURN_STATE = 4 (공격자가 턴 중)
        attacker.state = 3; // DEATH_MATCH_STATE = 3 (공격자 대기)
        defender.state = 4; // DEATH_MATCH_TURN_STATE = 4 (방어자 턴)
      } else if (defender.state === 4) { // DEATH_MATCH_TURN_STATE = 4 (방어자가 턴 중)
        attacker.state = 4; // DEATH_MATCH_TURN_STATE = 4 (공격자 턴)
        defender.state = 3; // DEATH_MATCH_STATE = 3 (방어자 대기)
      }
    }
  }

  /**
   * 현피 종료
   */
  private endDeathMatch(gameState: GameState) {
    console.log(`[MockGameServer] 현피 종료`);
    
    gameState.deathMatchActive = false;
    gameState.deathMatchAttacker = null;
    gameState.deathMatchDefender = null;
    
    // 모든 플레이어 상태 초기화
    gameState.players.forEach(player => {
      player.state = 0; // NONE_CHARACTER_STATE = 0
    });
  }

  /**
   * 게임 상태 업데이트 알림 전송
   */
  private sendGameStateUpdate(roomId: number) {
    const gameState = this.gameStates.get(roomId);
    if (!gameState) return;

    // 모든 플레이어에게 상태 업데이트 알림 전송
    this.players.forEach(player => {
      if (player.roomId === roomId && player.isConnected) {
        const notification: GamePacket = {
          payload: {
            oneofKind: GamePacketType.userUpdateNotification,
            userUpdateNotification: {
              user: gameState.players.map(p => ({
                id: p.id.replace('player', '') || '0',
                nickname: p.nickname,
                character: {
                  characterType: 1, // RED
                  roleType: 1, // TARGET
                  hp: p.hp,
                  weapon: 0,
                  stateInfo: {
                    state: p.state, // 이미 숫자로 저장되어 있음
                    nextState: 0,
                    nextStateAt: '0',
                    stateTargetUserId: '0' // string 타입
                  },
                  equips: [],
                  debuffs: [],
                  handCards: p.handCards,
                  bbangCount: 1,
                  handCardsCount: p.handCards.reduce((sum, card) => sum + card.count, 0)
                }
              }))
            }
          }
        };
        
        this.sendToPlayer(player, notification);
      }
    });
  }

  /**
   * 특정 플레이어에게 패킷 전송
   */
  private sendToPlayer(player: TestPlayer, packet: GamePacket) {
    if (!player.isConnected || player.socket.destroyed) return;
    
    try {
      const buffer = encodePacket(packet, 1, Math.floor(Math.random() * 1000));
      player.socket.write(buffer);
      console.log(`[MockGameServer] 패킷 전송: ${player.id}`, packet.payload?.oneofKind);
    } catch (error) {
      console.error(`[MockGameServer] 패킷 전송 오류:`, error);
    }
  }

  /**
   * 현재 게임 상태 조회
   */
  getGameState(roomId: number): GameState | undefined {
    return this.gameStates.get(roomId);
  }

  /**
   * 연결된 플레이어 수 조회
   */
  getConnectedPlayerCount(): number {
    return Array.from(this.players.values()).filter(p => p.isConnected).length;
  }
}
