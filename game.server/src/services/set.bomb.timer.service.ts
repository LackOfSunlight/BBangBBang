import { warnNotificationPacketForm } from '../converter/packet.form';
import { broadcastDataToRoom } from '../sockets/notification';
import { CardType, WarningType } from '../generated/common/enums';
import { GamePacketType } from '../enums/gamePacketType';
import { Room } from '../models/room.model';
import { User } from '../models/user.model';
import { BombCard } from '../card/class/card.bomb';
import { getCard } from '../dispatcher/apply.card.dispacher';

/**  폭탄 매니저*/
class SetBombTimer {
	private static instance: SetBombTimer;

	// 	key					value
	// roomId:userId → { timer, explosionAt }
	private bombTimers: Map<string, { timer: NodeJS.Timeout; explosionAt: number }>;

	private constructor() {
		this.bombTimers = new Map(); // 유저 + 타이머/폭발시간
	}

	public static getInstance(): SetBombTimer {
		if (!SetBombTimer.instance) {
			SetBombTimer.instance = new SetBombTimer();
		}
		return SetBombTimer.instance;
	}

	public startBombTimer(room: Room, bombUser: User, explosionAt: number) {
		const key = `${room.id}:${bombUser.id}`;
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
				const bomb = getCard(CardType.BOMB) as BombCard;
				bomb.bombExplosion(room, bombUser);
			}
		}, 1000);

		this.bombTimers.set(key, { timer, explosionAt });
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
	public clearRoom(room: Room) {
		for (const key of this.bombTimers.keys()) {
			if (key.startsWith(`${room.id}:`)) {
				clearInterval(this.bombTimers.get(key)!.timer);
				this.bombTimers.delete(key);
			}
		}
		console.log(`[BOMB] Room ${room.id} 타이머 제거 완료`);
	}
}
export const setBombTimer = SetBombTimer.getInstance();
