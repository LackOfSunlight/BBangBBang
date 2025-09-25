import { getRoom, getUserFromRoom } from "../utils/room.utils";
import { warnNotificationPacketForm } from "../converter/packet.form";
import { broadcastDataToRoom } from "../sockets/notification";
import { WarningType } from "../generated/common/enums";
import { GamePacketType } from "../enums/gamePacketType";
import { bombExplosion } from "../card/debuff/card.bomb.effect";

/**  폭탄 매니저*/
class BombManager {
  private static instance: BombManager;

  // 	key					value
  // roomId:userId → { timer, explosionAt }
  private bombTimers: Map<string, {timer:NodeJS.Timeout; explosionAt:number}>;

  private constructor() {
    this.bombTimers = new Map(); // 유저 + 타이머/폭발시간
  }

  public static getInstance(): BombManager {
    if (!BombManager.instance) {
      BombManager.instance = new BombManager();
    }
    return BombManager.instance;
  }

  public startBombTimer(roomId: number, userId: string, explosionAt: number) {
    const room = getRoom(roomId);
    const bombUser = getUserFromRoom(roomId, userId);
    const key = `${roomId}:${userId}`;
    // 기존 타이머 제거
    if (this.bombTimers.has(key)) {
      clearInterval(this.bombTimers.get(key)!.timer);
      this.bombTimers.delete(key);
    }
    
    const timer = setInterval(() => {
      const remain = Math.ceil((explosionAt - Date.now()) / 1000);
      console.warn(`[BOMB][${bombUser.nickname}] 남은 시간: ${remain}s`);

        if (remain <= 0) {
            // 경고 패킷 초기화
            const warnExplosionOver = warnNotificationPacketForm(WarningType.NO_WARNING, `0`);
            broadcastDataToRoom(room.users, warnExplosionOver, GamePacketType.warningNotification);
            // 타이머 제거
            clearInterval(timer);
            this.bombTimers.delete(key);
            // 폭발 로직 처리
            bombExplosion(roomId, userId);
            
        }
        // else if(remain === 29){
        // 	// 경고 패킷 활성화 
        // 	const warnExplosion = warnNotificationPacketForm(WarningType.BOMB_WANING, `${remain}`);
        // 	broadcastDataToRoom(room.users, warnExplosion, GamePacketType.warningNotification);
        // }

    }, 1000);

    this.bombTimers.set(key, {timer, explosionAt});
  }

  // 타이머 초기화
  public clearTimer(key: string) {
    if (this.bombTimers.has(key)) {
      const leftTime = this.bombTimers.get(key)!.explosionAt;
      clearInterval(this.bombTimers.get(key)!.timer);
      this.bombTimers.delete(key);
      return leftTime;
    }
    return 0;
  }

  // 방의 잔여 타이머 전부 초기화
  public clearRoom(roomId: number) {
    for (const key of this.bombTimers.keys()) {
      if (key.startsWith(`${roomId}:`)) {
        clearInterval(this.bombTimers.get(key)!.timer);
        this.bombTimers.delete(key);
      }
    }
    console.log(`[BOMB] Room ${roomId} 타이머 제거 완료`);
  }
}
export const bombManager = BombManager.getInstance();