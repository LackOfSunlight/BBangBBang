/**
 * E2E 테스트용 TCP 소켓 유틸리티
 * 
 * 이 파일은 현피 E2E 테스트에서 TCP 소켓 통신을 시뮬레이션하기 위한
 * 헬퍼 함수들을 제공합니다.
 * 
 * 주요 기능:
 * - TCP 소켓 연결 및 패킷 송수신
 * - 바이너리 패킷 인코딩/디코딩 (실제 프로젝트 프로토콜 기반)
 * - 비동기 패킷 수신 대기
 * - 테스트용 클라이언트 래퍼
 */

import net from 'net';
import { GamePacket } from '../../generated/gamePacket.js';
import { GamePacketType } from '../../enums/gamePacketType.js';

export type Packet = { type: string; [k: string]: any };

/**
 * 실제 프로젝트의 패킷 구조에 맞춘 인코딩 함수
 * - 헤더: type(2) + verLen(1) + version + seq(4) + payloadLen(4)
 * - 페이로드: GamePacket 바이너리 데이터
 */
export const encodePacket = (packet: GamePacket, payloadType: number = 1, sequence: number = 1): Buffer => {
  // GamePacket을 바이너리로 변환
  const payloadBuffer = Buffer.from(GamePacket.toBinary(packet));
  
  // 버전 문자열
  const version = '1.0.0';
  const versionBuffer = Buffer.from(version, 'utf8');
  
  // 헤더 구성 (실제 프로젝트와 동일한 구조)
  const headerLen = 2 + 1 + versionBuffer.length + 4 + 4;
  const header = Buffer.alloc(headerLen);
  
  let offset = 0;
  header.writeUint16BE(payloadType, offset); offset += 2; // payloadType
  header.writeUint8(versionBuffer.length, offset); offset += 1; // versionLength
  versionBuffer.copy(header, offset); offset += versionBuffer.length; // version
  header.writeUint32BE(sequence, offset); offset += 4; // sequence
  header.writeUint32BE(payloadBuffer.length, offset); offset += 4; // payloadLength
  
  return Buffer.concat([header, payloadBuffer]);
};

/**
 * 바이너리 데이터를 패킷으로 디코딩
 */
export const decodePacket = (buffer: Buffer): GamePacket | null => {
  try {
    // 실제 프로젝트의 패킷 디코딩 로직
    if (buffer.length < 11) return null; // 최소 헤더 크기
    
    let offset = 0;
    const payloadType = buffer.readUint16BE(offset); offset += 2;
    const versionLength = buffer.readUint8(offset); offset += 1;
    
    if (buffer.length < offset + versionLength + 8) return null; // 헤더 불완전
    
    const version = buffer.toString('utf8', offset, offset + versionLength); offset += versionLength;
    const sequence = buffer.readUint32BE(offset); offset += 4;
    const payloadLength = buffer.readUint32BE(offset); offset += 4;
    
    if (buffer.length < offset + payloadLength) return null; // 페이로드 불완전
    
    const payloadBuffer = buffer.subarray(offset, offset + payloadLength);
    return GamePacket.fromBinary(payloadBuffer);
  } catch (error) {
    console.error('패킷 디코딩 오류:', error);
    return null;
  }
};

/**
 * 스트림에서 패킷을 파싱하는 디코더
 * - TCP 스트림에서 완전한 패킷을 추출
 */
export const createPacketDecoder = (
  onPacket: (packet: GamePacket) => void,
  onError?: (error: Error) => void
) => {
  let buffer = Buffer.alloc(0);
  
  return (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);
    
    while (buffer.length >= 11) { // 최소 헤더 크기
      const payloadType = buffer.readUint16BE(0);
      const versionLength = buffer.readUint8(2);
      const headerLen = 2 + 1 + versionLength + 4 + 4;
      
      if (buffer.length < headerLen) return;
      
      const payloadLength = buffer.readUint32BE(3 + versionLength + 4);
      
      if (buffer.length < headerLen + payloadLength) return;
      
      const payloadStart = headerLen;
      const payloadEnd = headerLen + payloadLength;
      const payloadBuffer = buffer.subarray(payloadStart, payloadEnd);
      
      try {
        const packet = GamePacket.fromBinary(payloadBuffer);
        onPacket(packet);
      } catch (error) {
        console.error('패킷 파싱 오류:', error);
        onError?.(error as Error);
      }
      
      buffer = buffer.subarray(payloadEnd);
    }
  };
};

/**
 * 조건을 만족할 때까지 대기하는 헬퍼 함수
 * - 테스트에서 특정 상태나 패킷을 기다릴 때 사용
 */
export const waitFor = <T>(
  predicate: () => T | undefined,
  timeoutMs = 5000,
  intervalMs = 50
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    
    const check = () => {
      const result = predicate();
      if (result !== undefined) {
        resolve(result);
        return;
      }
      
      if (Date.now() > deadline) {
        reject(new Error(`Timeout after ${timeoutMs}ms`));
        return;
      }
      
      setTimeout(check, intervalMs);
    };
    
    check();
  });
};

/**
 * 테스트용 클라이언트 래퍼
 * - TCP 소켓 연결, 패킷 송수신, 상태 관리
 */
export type TestClient = {
  socket: net.Socket;
  send: (packet: GamePacket) => void;
  receive: () => Promise<GamePacket>;
  close: () => Promise<void>;
  isConnected: boolean;
};

/**
 * 테스트 서버에 연결하는 클라이언트 생성
 */
export const createTestClient = (port: number): Promise<TestClient> => {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ port }, () => {
      const receivedPackets: GamePacket[] = [];
      const waitingResolvers: ((packet: GamePacket) => void)[] = [];
      
      // 패킷 수신 처리
      socket.on('data', createPacketDecoder(
        (packet) => {
          if (waitingResolvers.length > 0) {
            const resolver = waitingResolvers.shift()!;
            resolver(packet);
          } else {
            receivedPackets.push(packet);
          }
        },
        (error) => {
          console.error('Packet decode error:', error);
        }
      ));
      
      socket.on('error', reject);
      socket.on('close', () => {
        // 연결 종료 시 대기 중인 resolver들을 정리
        waitingResolvers.forEach(resolver => {
          resolver(null as any);
        });
      });
      
      const client: TestClient = {
        socket,
        send: (packet) => {
          const buffer = encodePacket(packet, 1, Math.floor(Math.random() * 1000));
          socket.write(buffer);
        },
        receive: () => {
          return new Promise<GamePacket>((resolve) => {
            if (receivedPackets.length > 0) {
              resolve(receivedPackets.shift()!);
            } else {
              waitingResolvers.push(resolve);
            }
          });
        },
        close: () => {
          return new Promise<void>((resolve) => {
            socket.end(() => resolve());
          });
        },
        isConnected: true
      };
      
      resolve(client);
    });
  });
};

/**
 * 테스트용 게임 상태 시뮬레이션
 * - 현피 상태, 플레이어 정보, 턴 관리 등을 시뮬레이션
 */
export type GameState = {
  roomId: number;
  players: {
    id: string;
    nickname: string;
    hp: number;
    state: number; // CharacterStateType enum 값 (숫자)
    handCards: Array<{ type: number; count: number }>;
  }[];
  currentTurn: string | null;
  deathMatchActive: boolean;
  deathMatchAttacker: string | null;
  deathMatchDefender: string | null;
};

/**
 * 기본 게임 상태 생성
 */
export const createTestGameState = (roomId: number): GameState => ({
  roomId,
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
