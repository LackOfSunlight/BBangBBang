import {
	userUpdateNotificationPacketForm,
	warnNotificationPacketForm,
} from '../../converter/packet.form';
import { CardCategory } from '../../enums/card.category';
import { GamePacketType } from '../../enums/gamePacketType';
import { AnimationType, CardType, WarningType } from '../../generated/common/enums';
import { playAnimationHandler } from '../../handlers/play.animation.handler';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { checkAndEndGameIfNeeded } from '../../services/game.end.service';
import { setBombTimer } from '../../services/set.bomb.timer.service';
import takeDamageService from '../../services/take.damage.service';
import { broadcastDataToRoom } from '../../sockets/notification';
import { ICard } from '../../type/card';

export class BombCard implements ICard {
	type: CardType = CardType.BOMB;
	cardCategory: CardCategory = CardCategory.targetCard;

	public useCard(room: Room, user: User, target: User): boolean {
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

		room.removeCard(user, CardType.BOMB);
		// 이미 해당 디버프 상태일 경우 ; 중복 검증
		if (target.character.debuffs.includes(CardType.BOMB)) {
			console.error(`[BOMB]이미 ${target.nickname} 유저는 폭탄을 보유중입니다.`);
			return false;
		}

		target.character.debuffs.push(CardType.BOMB);

		const explosionTime = Date.now() + 30000;

		const toRoom = room.toData();
		// 시작전 패킷 송신
		const warnExplosion = warnNotificationPacketForm(WarningType.BOMB_WANING, `${explosionTime}`);
		broadcastDataToRoom(toRoom.users, warnExplosion, GamePacketType.warningNotification);
		// 인게임 제한시간 : 30초 / 테스트 제한시간 : 10초
		setBombTimer.startBombTimer(room, target, explosionTime);

		return true;
	}

	// setBombTimer 분리 후 ../../services/bomb.service 에 배치

	/** 폭발 처리 */
	public bombExplosion(room: Room, userInExplode: User) {
		if (!userInExplode || !userInExplode.character) {
			console.error(`[BOMB] 잘못된 유저 정보 입니다`);
			return;
		}

		const bombCardIndex = userInExplode.character.debuffs.findIndex((c) => c === CardType.BOMB);
		if (bombCardIndex === -1) {
			console.error('[BOMB] 폭탄 디버프가 존재하지 않습니다');
			return;
		}

		takeDamageService(room, userInExplode, 2);
		userInExplode.character.debuffs.splice(bombCardIndex, 1);
		checkAndEndGameIfNeeded(room.id);

		const toRoom = room.toData();

		//animation 추후 추가 예정
		playAnimationHandler(toRoom.users, userInExplode.id, AnimationType.BOMB_ANIMATION);

		const userUpdateNotificationPacket = userUpdateNotificationPacketForm(toRoom.users);
		broadcastDataToRoom(
			toRoom.users,
			userUpdateNotificationPacket,
			GamePacketType.userUpdateNotification,
		);
		console.log(`[BOMB] 폭탄이 ${userInExplode.nickname} 에서 폭발하였습니다`);
	}
}
