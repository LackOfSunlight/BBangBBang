// cardType = 22
import { AnimationType, CardType, WarningType } from '../../generated/common/enums';
import { GamePacketType } from '../../enums/gamePacketType';
import { warnNotificationPacketForm } from '../../converter/packet.form';
import { userUpdateNotificationPacketForm } from '../../converter/packet.form';
import { broadcastDataToRoom } from '../../sockets/notification';
import { playAnimationHandler } from '../../handlers/play.animation.handler';
import { checkAndEndGameIfNeeded } from '../../services/game.end.service';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { bombManager } from '../../services/bomb.service';

/** 폭탄 디버프 부여 */
const cardBombEffect = (room: Room, user: User, target: User): boolean => {
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
	// 시작전 패킷 송신
	const warnExplosion = warnNotificationPacketForm(WarningType.BOMB_WANING, `${explosionTime}`);
	broadcastDataToRoom(room.users, warnExplosion, GamePacketType.warningNotification);
	// 인게임 제한시간 : 30초 / 테스트 제한시간 : 10초
	bombManager.startBombTimer(room, target, explosionTime);

	return true;
};

// bombManager 분리 후 ../../services/bomb.service 에 배치

/** 폭발 처리 */
export const bombExplosion = (room: Room, userInExplode: User) => {
	if (!userInExplode || !userInExplode.character) {
		console.error(`[BOMB] 잘못된 유저 정보 입니다`);
		return;
	}

	const bombCardIndex = userInExplode.character.debuffs.findIndex((c) => c === CardType.BOMB);
	if (bombCardIndex === -1) {
		console.error('[BOMB] 폭탄 디버프가 존재하지 않습니다');
		return;
	}

	//animation 추후 추가 예정
	playAnimationHandler(room.users, userInExplode.id, AnimationType.BOMB_ANIMATION);

	userInExplode.character.hp -= 2;
	userInExplode.character.debuffs.splice(bombCardIndex, 1);
	checkAndEndGameIfNeeded(room.id);

	const userUpdateNotificationPacket = userUpdateNotificationPacketForm(room.users);
	broadcastDataToRoom(
		room.users,
		userUpdateNotificationPacket,
		GamePacketType.userUpdateNotification,
	);
	console.log(`[BOMB] 폭탄이 ${userInExplode.nickname} 에서 폭발하였습니다`);
};

export default cardBombEffect;
