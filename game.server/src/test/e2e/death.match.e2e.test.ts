/**
 * 현피 E2E 테스트
 * 
 * 이 테스트는 TCP 소켓 통신을 시뮬레이션하여 현피 카드의 전체 시나리오를 검증합니다.
 * 
 * 테스트 시나리오:
 * 1) 현피 카드 사용부터 최종 승부까지 전체 플로우
 * 2) TCP 소켓 연결 및 패킷 전송/수신 시뮬레이션
 * 3) 클라이언트 상태 변경 검증
 * 4) 턴 교대 및 반복 로직 테스트
 * 
 * 각 테스트는 실제 게임에서 발생할 수 있는 상황을 시뮬레이션하며,
 * 서버와 클라이언트 간의 통신이 올바르게 작동하는지 검증합니다.
 */

import { MockGameServer } from './mock.game.server.js';
import { createTestClient, waitFor, GameState } from './tcp.test.utils.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { CardType, CharacterStateType } from '../../generated/common/enums.js';

describe('현피 E2E 테스트', () => {
  // 각 테스트마다 독립적인 서버 사용

  describe('1. 현피 카드 사용부터 최종 승부까지 전체 플로우', () => {
    it('현피 카드 사용 시 전체 시나리오가 정상 작동해야 함', async () => {
      // 시나리오 설명:
      // 1. 두 플레이어가 서버에 연결
      // 2. 플레이어1이 현피 카드를 사용하여 현피 시작
      // 3. 플레이어2가 빵야 카드로 응답하여 턴 교대
      // 4. 플레이어1이 다시 빵야 카드로 응답
      // 5. 플레이어2가 빵야 카드가 없어서 패스
      // 6. 플레이어2 HP 감소 및 현피 종료

      console.log('=== 현피 전체 시나리오 테스트 시작 ===');

      // 독립적인 모의 서버 생성
      const testPort = 3001 + Math.floor(Math.random() * 1000);
      const mockServer = new MockGameServer(testPort);
      await mockServer.start();

      try {
        // 1. 두 플레이어 연결
        const player1 = await createTestClient(testPort);
        const player2 = await createTestClient(testPort);

      // 2. 로그인 및 방 참가 (순차적으로 실행)
      const login1Success = await performLogin(player1, 'player1');
      console.log(`[E2E] player1 로그인 결과: ${login1Success}`);
      expect(login1Success).toBe(true);
      
      const login2Success = await performLogin(player2, 'player2');
      console.log(`[E2E] player2 로그인 결과: ${login2Success}`);
      expect(login2Success).toBe(true);
      
      const join1Response = await performJoinRoom(player1);
      console.log(`[E2E] player1 방 참가 결과: ${join1Response.payload?.oneofKind}`);
      
      const join2Response = await performJoinRoom(player2);
      console.log(`[E2E] player2 방 참가 결과: ${join2Response.payload?.oneofKind}`);

      // 3. 현피 카드 사용 (플레이어1 -> 플레이어2)
      console.log('현피 카드 사용: player1 -> player2');
      await useCard(player1, CardType.DEATH_MATCH, 'player2');

      // 4. 현피 상태 확인
      const gameState = await waitForGameStateUpdate(mockServer);
      expect(gameState.deathMatchActive).toBe(true);
      expect(gameState.deathMatchAttacker).toBe('player1');
      expect(gameState.deathMatchDefender).toBe('player2');

      // 5. 플레이어2가 빵야 카드로 응답
      console.log('빵야 카드 사용: player2 -> player1');
      await useCard(player2, CardType.BBANG, 'player1');

      // 6. 턴 교대 확인
      const gameStateAfterTurn = await waitForGameStateUpdate(mockServer);
      const player1Data = gameStateAfterTurn.players.find(p => p.id === 'player1');
      const player2Data = gameStateAfterTurn.players.find(p => p.id === 'player2');
      
      console.log(`[E2E] CharacterStateType.DEATH_MATCH_STATE = ${CharacterStateType.DEATH_MATCH_STATE}`);
      console.log(`[E2E] CharacterStateType.DEATH_MATCH_TURN_STATE = ${CharacterStateType.DEATH_MATCH_TURN_STATE}`);
      console.log(`[E2E] player1Data?.state = ${player1Data?.state}`);
      console.log(`[E2E] player2Data?.state = ${player2Data?.state}`);
      
      expect(player1Data?.state).toBe(CharacterStateType.DEATH_MATCH_STATE);
      expect(player2Data?.state).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);

      // 7. 플레이어1이 다시 빵야 카드로 응답
      console.log('빵야 카드 사용: player1 -> player2');
      await useCard(player1, CardType.BBANG, 'player2');

      // 8. 턴 교대 확인
      const gameStateAfterTurn2 = await waitForGameStateUpdate(mockServer);
      const player1DataAfterTurn2 = gameStateAfterTurn2.players.find(p => p.id === 'player1');
      const player2DataAfterTurn2 = gameStateAfterTurn2.players.find(p => p.id === 'player2');
      
      expect(player1DataAfterTurn2?.state).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);
      expect(player2DataAfterTurn2?.state).toBe(CharacterStateType.DEATH_MATCH_STATE);

      // 9. 플레이어2가 빵야 카드가 없어서 패스
      console.log('현피 패스: player2');
      await passReaction(player2);

      // 10. 현피 종료 및 HP 감소 확인
      const finalGameState = await waitForGameStateUpdate(mockServer);
      expect(finalGameState.deathMatchActive).toBe(false);
      
      const player2FinalData = finalGameState.players.find(p => p.id === 'player2');
      expect(player2FinalData?.hp).toBe(3); // 4 -> 3으로 감소

        console.log('=== 현피 전체 시나리오 테스트 완료 ===');

        // 연결 정리
        await player1.close();
        await player2.close();
      } finally {
        // 서버 정리
        await mockServer.stop();
      }
    }, 10000); // 10초 타임아웃
  });

  describe('2. TCP 소켓 연결 및 패킷 송수신 시뮬레이션', () => {
    it('TCP 연결 및 패킷 통신이 정상 작동해야 함', async () => {
      // 시나리오 설명:
      // - 클라이언트가 TCP 서버에 연결
      // - 로그인, 방 참가, 카드 사용 등의 패킷 송수신
      // - 각 패킷의 응답이 올바르게 수신되는지 확인

      console.log('=== TCP 통신 테스트 시작 ===');

      // 독립적인 모의 서버 생성
      const testPort = 3001 + Math.floor(Math.random() * 1000);
      const mockServer = new MockGameServer(testPort);
      await mockServer.start();

      try {
        const client = await createTestClient(testPort);
      expect(client.isConnected).toBe(true);

      // 로그인 패킷 전송 및 응답 확인
      const loginSuccess = await performLogin(client, 'testPlayer');
      expect(loginSuccess).toBe(true);

      // 방 참가 패킷 전송 및 응답 확인
      const joinResponse = await performJoinRoom(client);
      expect(joinResponse.payload?.oneofKind).toBe(GamePacketType.joinRoomResponse);
      if (joinResponse.payload?.oneofKind === GamePacketType.joinRoomResponse) {
        expect(joinResponse.payload.joinRoomResponse?.success).toBe(true);
      }

      // 카드 사용 패킷 전송 및 응답 확인
      const useCardResponse = await useCard(client, CardType.BBANG, 'player2');
      expect(useCardResponse.payload?.oneofKind).toBe(GamePacketType.useCardResponse);
      if (useCardResponse.payload?.oneofKind === GamePacketType.useCardResponse) {
        expect(useCardResponse.payload.useCardResponse?.success).toBe(true);
      }

        console.log('=== TCP 통신 테스트 완료 ===');

        await client.close();
      } finally {
        // 서버 정리
        await mockServer.stop();
      }
    });
  });

  describe('3. 클라이언트 상태 변경 검증', () => {
    it('현피 중 상태 변경이 올바르게 반영되어야 함', async () => {
      // 시나리오 설명:
      // - 현피 카드 사용 시 플레이어 상태가 DEATH_MATCH_TURN_STATE로 변경
      // - 대상자 상태가 DEATH_MATCH_STATE로 변경
      // - 빵야 카드 사용 시 턴이 교대되어 상태가 변경
      // - 현피 종료 시 모든 상태가 NONE_CHARACTER_STATE로 초기화

      console.log('=== 상태 변경 검증 테스트 시작 ===');

      // 독립적인 모의 서버 생성
      const testPort = 3001 + Math.floor(Math.random() * 1000);
      const mockServer = new MockGameServer(testPort);
      await mockServer.start();

      try {
        const player1 = await createTestClient(testPort);
        const player2 = await createTestClient(testPort);

      await performLogin(player1, 'player1');
      await performLogin(player2, 'player2');
      await performJoinRoom(player1);
      await performJoinRoom(player2);

      // 현피 카드 사용 전 상태 확인
      let gameState = mockServer.getGameState(1);
      expect(gameState?.players[0].state).toBe(0); // NONE_CHARACTER_STATE = 0
      expect(gameState?.players[1].state).toBe(0); // NONE_CHARACTER_STATE = 0

      // 현피 카드 사용
      await useCard(player1, CardType.DEATH_MATCH, 'player2');

      // 현피 상태 확인
      gameState = await waitForGameStateUpdate(mockServer);
      const player1Data = gameState.players.find(p => p.id === 'player1');
      const player2Data = gameState.players.find(p => p.id === 'player2');
      
      expect(player1Data?.state).toBe(CharacterStateType.DEATH_MATCH_STATE);
      expect(player2Data?.state).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);

      // 빵야 카드 사용으로 턴 교대
      await useCard(player2, CardType.BBANG, 'player1');

      gameState = await waitForGameStateUpdate(mockServer);
      const player1DataAfterTurn = gameState.players.find(p => p.id === 'player1');
      const player2DataAfterTurn = gameState.players.find(p => p.id === 'player2');
      
      expect(player1DataAfterTurn?.state).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);
      expect(player2DataAfterTurn?.state).toBe(CharacterStateType.DEATH_MATCH_STATE);

      // 현피 패스로 종료
      await passReaction(player1);

      // 현피 종료 후 상태 확인
      gameState = await waitForGameStateUpdate(mockServer);
      const player1DataFinal = gameState.players.find(p => p.id === 'player1');
      const player2DataFinal = gameState.players.find(p => p.id === 'player2');
      
      expect(player1DataFinal?.state).toBe(0); // NONE_CHARACTER_STATE = 0
      expect(player2DataFinal?.state).toBe(0); // NONE_CHARACTER_STATE = 0
      expect(gameState.deathMatchActive).toBe(false);

        console.log('=== 상태 변경 검증 테스트 완료 ===');

        await player1.close();
        await player2.close();
      } finally {
        // 서버 정리
        await mockServer.stop();
      }
    });
  });

  describe('4. 턴 교대 및 반복 로직 테스트', () => {
    it('현피 중 턴 교대가 올바르게 작동해야 함', async () => {
      // 시나리오 설명:
      // - 현피가 시작되면 공격자와 방어자가 정해짐
      // - 빵야 카드 사용 시마다 턴이 교대됨
      // - 여러 라운드에 걸쳐 턴 교대가 정확히 이루어지는지 확인

      console.log('=== 턴 교대 테스트 시작 ===');

      // 독립적인 모의 서버 생성
      const testPort = 3001 + Math.floor(Math.random() * 1000);
      const mockServer = new MockGameServer(testPort);
      await mockServer.start();

      try {
        const player1 = await createTestClient(testPort);
        const player2 = await createTestClient(testPort);

      await performLogin(player1, 'player1');
      await performLogin(player2, 'player2');
      await performJoinRoom(player1);
      await performJoinRoom(player2);

      // 현피 시작
      await useCard(player1, CardType.DEATH_MATCH, 'player2');

      // 초기 턴 확인 (플레이어1이 공격자)
      let gameState = await waitForGameStateUpdate(mockServer);
      let player1Data = gameState.players.find(p => p.id === 'player1');
      let player2Data = gameState.players.find(p => p.id === 'player2');
      
      expect(player1Data?.state).toBe(CharacterStateType.DEATH_MATCH_STATE);
      expect(player2Data?.state).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);

      // 3라운드 턴 교대 테스트
      for (let round = 1; round <= 3; round++) {
        console.log(`라운드 ${round} 시작`);

        // 플레이어1 턴 -> 빵야 카드 사용
        await useCard(player1, CardType.BBANG, 'player2');
        gameState = await waitForGameStateUpdate(mockServer);
        player1Data = gameState.players.find(p => p.id === 'player1');
        player2Data = gameState.players.find(p => p.id === 'player2');
        
        expect(player1Data?.state).toBe(CharacterStateType.DEATH_MATCH_STATE);
        expect(player2Data?.state).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);

        // 플레이어2 턴 -> 빵야 카드 사용
        await useCard(player2, CardType.BBANG, 'player1');
        gameState = await waitForGameStateUpdate(mockServer);
        player1Data = gameState.players.find(p => p.id === 'player1');
        player2Data = gameState.players.find(p => p.id === 'player2');
        
        expect(player1Data?.state).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);
        expect(player2Data?.state).toBe(CharacterStateType.DEATH_MATCH_STATE);

        console.log(`라운드 ${round} 완료`);
      }

      // 현피 종료
      await passReaction(player1);
      gameState = await waitForGameStateUpdate(mockServer);
      expect(gameState.deathMatchActive).toBe(false);

        console.log('=== 턴 교대 테스트 완료 ===');

        await player1.close();
        await player2.close();
      } finally {
        // 서버 정리
        await mockServer.stop();
      }
    });
  });

  // 헬퍼 메서드들

  /**
   * 로그인 수행
   */
  async function performLogin(client: any, playerId: string): Promise<boolean> {
    const loginRequest: GamePacket = {
      payload: {
        oneofKind: GamePacketType.loginRequest,
        loginRequest: {
          email: '',
          password: ''
        }
      }
    };

    client.send(loginRequest);
    const response = await client.receive();
    
    // 로그인 응답 확인
    const isLoginSuccess = response.payload?.oneofKind === GamePacketType.loginResponse && 
                          response.payload?.loginResponse?.success === true;
    
    console.log(`[E2E] 로그인 결과: ${playerId} - ${isLoginSuccess ? '성공' : '실패'}`);
    console.log(`[E2E] 응답 타입: ${response.payload?.oneofKind}`);
    console.log(`[E2E] 응답 내용:`, JSON.stringify(response.payload, null, 2));
    console.log(`[E2E] success 값: ${response.payload?.loginResponse?.success}`);
    console.log(`[E2E] 타입 비교: ${response.payload?.oneofKind} === ${GamePacketType.loginResponse} = ${response.payload?.oneofKind === GamePacketType.loginResponse}`);
    
    return isLoginSuccess;
  }

  /**
   * 방 참가 수행
   */
  async function performJoinRoom(client: any): Promise<GamePacket> {
    const joinRequest: GamePacket = {
      payload: {
        oneofKind: GamePacketType.joinRoomRequest,
        joinRoomRequest: {
          roomId: 1
        }
      }
    };

    client.send(joinRequest);
    
    // joinRoomResponse를 받을 때까지 여러 패킷을 확인
    let response: GamePacket;
    do {
      response = await client.receive();
      console.log(`[E2E] 방 참가 응답 타입: ${response.payload?.oneofKind}`);
    } while (response.payload?.oneofKind !== GamePacketType.joinRoomResponse);
    
    return response;
  }

  /**
   * 카드 사용
   */
  async function useCard(client: any, cardType: CardType, targetUserId: string): Promise<GamePacket> {
    const useCardRequest: GamePacket = {
      payload: {
        oneofKind: GamePacketType.useCardRequest,
        useCardRequest: {
          cardType: cardType,
          targetUserId: targetUserId.replace('player', '') || '0'
        }
      }
    };

    client.send(useCardRequest);
    
    // useCardResponse를 받을 때까지 여러 패킷을 확인
    let response: GamePacket;
    do {
      response = await client.receive();
      console.log(`[E2E] 카드 사용 응답 타입: ${response.payload?.oneofKind}`);
    } while (response.payload?.oneofKind !== GamePacketType.useCardResponse);
    
    return response;
  }

  /**
   * 반응 패스
   */
  async function passReaction(client: any): Promise<GamePacket> {
    const reactionRequest: GamePacket = {
      payload: {
        oneofKind: GamePacketType.reactionRequest,
        reactionRequest: {
          reactionType: 1 // NOT_USE_CARD
        }
      }
    };

    client.send(reactionRequest);
    return await client.receive();
  }

  /**
   * 게임 상태 업데이트 대기
   */
  async function waitForGameStateUpdate(mockServer: MockGameServer): Promise<GameState> {
    return await waitFor(
      () => {
        const state = mockServer.getGameState(1);
        if (state) {
          console.log(`[E2E] 게임 상태 확인: deathMatchActive=${state.deathMatchActive}, players=${state.players.length}`);
          return state;
        }
        return undefined;
      },
      3000, // 3초로 단축
      50   // 50ms 간격으로 확인
    );
  }
});
