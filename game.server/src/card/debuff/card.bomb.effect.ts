// cardType = 22
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { removeCard } from '../../managers/card.manager';
import { AnimationType, CardType, WarningType } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { GamePacketType } from '../../enums/gamePacketType';
import { createUserUpdateNotificationPacket } from '../../useCase/use.card/use.card.usecase';
import { broadcastDataToRoom } from '../../utils/notification.util';
import { playAnimationHandler } from '../../handlers/play.animation.handler';
import { checkAndEndGameIfNeeded } from '../../utils/game.end.util';


/** 폭탄 디버프 부여 */
const cardBombEffect = (roomId: number, userId: string, targetUserId: string): boolean => {
	const user = getUserFromRoom(roomId, userId);
	const target = getUserFromRoom(roomId, targetUserId);
	const room = getRoom(roomId);
	// 유효성 검증
	if (!user || !user.character || !user.character.stateInfo) {
		console.error('[BOMB]사용자 정보가 존재하지 않습니다');
		return false;
	}
	if (!target || !target.character || !target.character.stateInfo) {
		console.error('[BOMB]타깃 유저의 정보가 존재하지 않습니다 ');
		return false;
	}
	if (!room) {
		console.error('[BOMB]방이 존재하지 않습니다.');
		return false;
	}

	// 이미 해당 디버프 상태일 경우 ; 중복 검증
	if (target.character.debuffs.includes(CardType.BOMB)) {
		console.error(`[BOMB]이미 ${target.nickname} 유저는 폭탄을 보유중입니다.`);
		return false;
	}
	
	// 카드 제거
	removeCard(user, room, CardType.BOMB);
	target.character!.debuffs.push(CardType.BOMB);
	const explosionTime = 30000; 
	// 인게임 제한시간 : 30초 / 테스트 제한시간 : 10초
	bombManager.startBombTimer(roomId, targetUserId, explosionTime);
	

	// 수정 정보 갱신
	try {
		updateCharacterFromRoom(roomId, userId, user.character);
		updateCharacterFromRoom(roomId, targetUserId, target.character)
		//saveRoom(room);
		//console.log('[BOMB]로그 저장에 성공하였습니다');
		return true;
	} catch (error) {
		console.error(`[BOMB]로그 저장에 실패하였습니다:[${error}]`);
		return false;
	}
};


/**  폭탄 매니저*/
class BombManager {
  private static instance: BombManager;
  private bombTimers: Map<string, NodeJS.Timeout>; // key: roomId:userId

  private constructor() {
    this.bombTimers = new Map();
  }

  public static getInstance(): BombManager {
    if (!BombManager.instance) {
      BombManager.instance = new BombManager();
    }
    return BombManager.instance;
  }

  public startBombTimer(roomId: number, userId: string, durationMs: number) {
	const room = getRoom(roomId);
	const bombUser = getUserFromRoom(roomId, userId);
    const key = `${roomId}:${userId}`;
    // 기존 타이머 제거
    if (this.bombTimers.has(key)) {
      clearInterval(this.bombTimers.get(key)!);
      this.bombTimers.delete(key);
    }

    const explosionAt = Date.now() + durationMs;

    const timer = setInterval(() => {
      const remain = Math.ceil((explosionAt - Date.now()) / 1000);
      console.log(`[BOMB][${bombUser.nickname}] 남은 시간: ${remain}s`);

    if (remain <= 0) {
        clearInterval(timer);
        this.bombTimers.delete(key);
        bombExplosion(roomId, userId);
    }
	else if(remain <= 10){
	  const warnExplosion = createWarnNotificationPacket(WarningType.BOMB_WANING, `${remain}`);
	  broadcastDataToRoom(room.users, warnExplosion, GamePacketType.warningNotification);
	}

    }, 1000);

    this.bombTimers.set(key, timer);
  }

  public clearRoom(roomId: number) {
    for (const key of this.bombTimers.keys()) {
      if (key.startsWith(`${roomId}:`)) {
        clearInterval(this.bombTimers.get(key)!);
        this.bombTimers.delete(key);
      }
    }
    console.log(`[BOMB] Room ${roomId} 타이머 제거 완료`);
  }
}
export const bombManager = BombManager.getInstance();


/** 폭발 처리 */
export const bombExplosion = (roomId:number, bombUserId: string ) => {
	const room = getRoom(roomId);
	if(!roomId){

		return;
	}
	const userInExplode = getUserFromRoom(roomId, bombUserId);
	if( !userInExplode || !userInExplode.character){
		console.error(`[BOMB] 잘못된 유저 정보 입니다`);
		return;
	}

	const bombCardIndex = userInExplode.character.debuffs.findIndex(c => c === CardType.BOMB);
	if(bombCardIndex === -1){
		console.error('[BOMB] 폭탄 디버프가 존재하지 않습니다');
		return;
	}

	//animation 추후 추가 예정
	playAnimationHandler(room.users, bombUserId, AnimationType.BOMB_ANIMATION);
	//await new Promise((resolve) => setTimeout(resolve, 3000)); // 3초 대기

	userInExplode.character.hp -= 2;
	userInExplode.character.debuffs.splice(bombCardIndex, 1);
	checkAndEndGameIfNeeded(roomId);

	const userUpdateNotificationPacket =  createUserUpdateNotificationPacket(room.users);
    broadcastDataToRoom(room.users, userUpdateNotificationPacket, GamePacketType.userUpdateNotification);
    console.log(`[BOMB] 폭탄이 ${userInExplode.nickname} 에서 폭발하였습니다`);

// 수정 정보 갱신
	try {
		updateCharacterFromRoom(roomId, bombUserId, userInExplode.character);
		//console.log('[BOMB]로그 저장에 성공하였습니다'); 
	} catch (error) {
		console.error(`[BOMB]로그 저장에 실패하였습니다:[${error}]`);
	}
};


// 경고 패킷 생성기
/** 
 *  message S2CWarningNotification {
	WarningType warningType = 1;
    int64 expectedAt = 2; // 밀리초 타임스탬프
} 
	*/
export const createWarnNotificationPacket = (
	warningType: WarningType,
	expectedAt: string
): GamePacket => {
	const NotificationPacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.warningNotification,
			warningNotification: {
				warningType: warningType,
				expectedAt : expectedAt
			},
		},
	};

	return NotificationPacket;
};


export default cardBombEffect;
