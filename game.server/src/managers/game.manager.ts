import { CardType, CharacterStateType, PhaseType } from '../generated/common/enums';
import { Room } from '../models/room.model';
import characterSpawnPosition from '../data/character.spawn.position.json';
import { CharacterPositionData } from '../generated/common/types';
import { shuffle } from '../utils/shuffle.util';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { broadcastDataToRoom } from '../utils/notification.util';
import { User } from '../models/user.model';
import { deleteRoom, getRoom, roomPhase, roomTimers, saveRoom } from '../utils/room.utils';
import { positionUpdateNotificationForm } from '../factory/packet.pactory';
import { cardManager } from './card.manager';

export const spawnPositions = characterSpawnPosition as CharacterPositionData[];
const positionUpdateIntervals = new Map<number, NodeJS.Timeout>();

export const notificationCharacterPosition = new Map<
  number, // roomId
  Map<string, CharacterPositionData> // userId → 위치 배열
>();

// 위치 변화 감지 플래그 (성능 최적화용)
export const roomPositionChanged = new Map<number, boolean>();

/**
 * 게임 매니저입니다.
 * 게임 시작/종료, 페이즈 관리, 위치 업데이트 등의 기능을 담당합니다.
 */
class GameManager {
  private static instance: GameManager;

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  /**
   * 게임을 시작합니다.
   * TODO: 게임 시작 시 초기 카드 분배 로직 추가 필요
   * TODO: 게임 시작 시 플레이어 위치 초기화 로직 추가 필요
   */
  public startGame(room: Room): void {
    console.log(`Starting game in room ${room.id}`);
    const roomId = `room:${room.id}`;
    const phase = PhaseType.DAY;
    roomPhase.set(roomId, phase);

    // 위치 변화 플래그 초기화 (최초 시작 시에는 true로 설정)
    roomPositionChanged.set(room.id, true);

    const intervalId = setInterval(() => broadcastPositionUpdates(room), 100);
    positionUpdateIntervals.set(room.id, intervalId);
    this.scheduleNextPhase(room.id, roomId);
  }

  /**
   * 다음 페이즈를 스케줄링합니다.
   * TODO: 페이즈 전환 시 특수 이벤트 처리 로직 추가 필요 (위성 타겟, 감옥 등)
   * TODO: 페이즈 전환 시 카드 드로우 로직 개선 필요
   */
  private scheduleNextPhase(roomId: number, roomTimerMapId: string): void {
    this.clearTimer(roomTimerMapId);
    const dayInterval = 60000; // 1분
    const eveningInterval = 30000; // 30초

    let nextPhase: PhaseType;
    let interval: number;
    if (roomPhase.get(roomTimerMapId) === PhaseType.DAY) {
      nextPhase = PhaseType.END;
      interval = dayInterval;
    } else {
      nextPhase = PhaseType.DAY;
      interval = eveningInterval;
    }

    const timer = setTimeout(async () => {
      const timerExecutionTime = Date.now();
      roomPhase.set(roomTimerMapId, nextPhase);
      let room = getRoom(roomId);
      if (!room) return;

      if (nextPhase === PhaseType.DAY) {
        // 1. 카드 처리
        for (let user of room.users) {
          if (user.character != null) {
            console.log(
              `${user.nickname}의 상태1:${CharacterStateType[user.character!.stateInfo!.state]}`,
            );

            // 카드 삭제 (체력보다 많은 카드 보유 시)
            if (user.character.handCardsCount > user.character.hp) {
              user = this.removedCard(room, user);
            }

            if (user.character!.stateInfo?.state !== CharacterStateType.CONTAINED) {
              const drawCards = cardManager.drawDeck(room.id, 2);
              drawCards.forEach((type) => {
                const existCard = user.character?.handCards.find((card: any) => card.type === type);
                if (existCard) {
                  existCard.count += 1;
                } else {
                  user.character?.handCards.push({ type, count: 1 });
                }
              });

              user.character!.handCardsCount = user.character!.handCards.reduce(
                (sum: number, card: any) => sum + card.count,
                0,
              );
            }

            user.character!.bbangCount = 0;
            if (user.character!.stateInfo!.state !== CharacterStateType.CONTAINED) {
              user.character!.stateInfo!.state = CharacterStateType.NONE_CHARACTER_STATE;
              user.character!.stateInfo!.nextState = CharacterStateType.NONE_CHARACTER_STATE;
              user.character!.stateInfo!.nextStateAt = '0';
              user.character!.stateInfo!.stateTargetUserId = '0';
            }
          }

          console.log(
            `${user.nickname}의 상태2:${CharacterStateType[user.character!.stateInfo!.state]}`,
          );
        }

        const userGamePacket: GamePacket = {
          payload: {
            oneofKind: GamePacketType.userUpdateNotification,
            userUpdateNotification: {
              user: room.users,
            },
          },
        };

        broadcastDataToRoom(room.users, userGamePacket, GamePacketType.userUpdateNotification);
      }

      const characterPosition = shuffle(spawnPositions);
      const roomMap = notificationCharacterPosition.get(room.id);

      if (roomMap) {
        // 페이즈 변경 시에는 모든 플레이어 위치를 새로 할당
        roomMap.clear();
        
        for (let i = 0; i < room.users.length; i++) {
          // 모든 플레이어(죽은 플레이어 포함)에게 새로운 위치 할당
          roomMap.set(room.users[i].id, characterPosition[i]);
        }
        
        // 페이즈 변경으로 인한 위치 변화 플래그 설정
        roomPositionChanged.set(room.id, true);
      }

      const newInterval = nextPhase === PhaseType.DAY ? dayInterval : eveningInterval;
      const elapsed = Date.now() - timerExecutionTime;
      const remainingTime = newInterval - elapsed;
      const phaseGamePacket: GamePacket = {
        payload: {
          oneofKind: GamePacketType.phaseUpdateNotification,
          phaseUpdateNotification: {
            phaseType: nextPhase,
            nextPhaseAt: `${remainingTime > 0 ? remainingTime : 0}`,
            characterPositions: characterPosition,
          },
        },
      };

      broadcastDataToRoom(room.users, phaseGamePacket, GamePacketType.phaseUpdateNotification);
      saveRoom(room);
      this.scheduleNextPhase(room.id, roomTimerMapId);
    }, interval);

    roomTimers.set(roomTimerMapId, timer);
  }

  /**
   * 게임을 종료합니다.
   */
  public endGame(room: Room): void {
    console.log(`Ending game in room ${room.id}`);
    const roomId = `room:${room.id}`;
    roomPhase.delete(roomId);
    const intervalId = positionUpdateIntervals.get(room.id);
    if (intervalId) {
      clearInterval(intervalId);
      positionUpdateIntervals.delete(room.id);
    }
    this.clearTimer(roomId);
    
    // 위치 변화 플래그 정리
    roomPositionChanged.delete(room.id);
    deleteRoom(room.id);
  }

  /**
   * 타이머를 정리합니다.
   */
  private clearTimer(roomId: string): void {
    const timer = roomTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      roomTimers.delete(roomId);
      console.log(`[Room ${roomId}] Timer cleared.`);
    }
  }

  /**
   * 사용자로부터 카드를 제거합니다.
   */
  private removedCard(room: Room, user: User): User {
    if (!user || !user.character) return user;

    const excess = user.character.handCardsCount - user.character.hp;
    let toRemove = excess;

    const removedCards: { type: CardType; count: number }[] = [];

    for (let i = 0; i < user.character.handCards.length && toRemove > 0; i++) {
      const card = user.character.handCards[i];

      if (card.count <= toRemove) {
        removedCards.push({ type: card.type, count: card.count });
        toRemove -= card.count;
        card.count = 0;
      } else {
        removedCards.push({ type: card.type, count: toRemove });
        card.count -= toRemove;
        toRemove = 0;
      }
    }

    user.character.handCards = user.character.handCards.filter((c: any) => c.count > 0);
    removedCards.forEach((c) => {
      for (let i = 0; i < c.count; i++) {
        cardManager.repeatDeck(room.id, [c.type]);
      }
    });

    return user;
  }
}

/**
 * 위치 업데이트를 브로드캐스트합니다.
 */
export const broadcastPositionUpdates = (room: Room): void => {
  const roomMap = notificationCharacterPosition.get(room.id);
  if (!roomMap) return;

  const phase = roomPhase.get(`room:${room.id}`);
  if (phase === PhaseType.END) return;

  // 변화가 없으면 브로드캐스트 생략 (성능 최적화)
  const hasChanged = roomPositionChanged.get(room.id);
  if (!hasChanged) {
    return;
  }

  const characterPositions: CharacterPositionData[] = [];
  
  for (const [userId, positionData] of roomMap.entries()) {
    characterPositions.push({
      id: userId,
      x: positionData.x,
      y: positionData.y,
    });
  }

  // 데이터가 있을 때만 브로드캐스트
  if (characterPositions.length > 0) {
    const gamePacket = positionUpdateNotificationForm(characterPositions);
    broadcastDataToRoom(room.users, gamePacket, GamePacketType.positionUpdateNotification);
    roomMap.clear();
  }

  // 변화 플래그 리셋
  roomPositionChanged.set(room.id, false);
};

export default GameManager.getInstance();