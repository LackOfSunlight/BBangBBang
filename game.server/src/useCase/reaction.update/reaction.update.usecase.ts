import { BBangCard } from '../../card/class/card.bbang';
import { GameSocket } from '../../type/game.socket';
import { GamePacketType } from '../../enums/gamePacketType';
import {
	ReactionType,
	GlobalFailCode,
	CharacterStateType,
	CardType,
} from '../../generated/common/enums';
import { weaponDamageEffect } from '../../init/weapon.Init';
import { CheckBigBbangService } from '../../services/bigbbang.check.service';
import { CheckGuerrillaService } from '../../services/guerrilla.check.service';
import { broadcastDataToRoom } from '../../sockets/notification';
import takeDamageService from '../../services/take.damage.service';
import { userUpdateNotificationPacketForm } from '../../converter/packet.form';
import roomManger from '../../managers/room.manager';
import { getCard } from '../../dispatcher/apply.card.dispacher';

export const reactionUpdateUseCase = async (
	socket: GameSocket,
	reactionType: ReactionType,
): Promise<{ success: boolean; failcode: GlobalFailCode }> => {
	// 유효성 검증
	const userId = socket.userId;
	const roomId = socket.roomId;
	if (!userId || !roomId) {
		return { success: false, failcode: GlobalFailCode.ROOM_NOT_FOUND };
	}

	let room = roomManger.getRoom(roomId);
	if (!room) {
		return { success: false, failcode: GlobalFailCode.ROOM_NOT_FOUND };
	}

	// 메인 로직
	if (reactionType === ReactionType.NONE_REACTION) {
		const user = room.users.find((u) => u.id === userId);

		if (user != null && user.character && user.character.stateInfo) {
			switch (user.character.stateInfo.state) {
				case CharacterStateType.BBANG_TARGET: {
					// 피격자(user)와 공격자(shooter) 정보 확인
					const bbagCard = getCard(CardType.BBANG) as BBangCard;
					const shooterId = user.character.stateInfo.stateTargetUserId;
					const shooter = room.users.find((u) => u.id === shooterId);
					if (!shooter || !shooter.character) break;

					let damage = bbagCard.BBangDamage; // 기본 데미지

					damage = weaponDamageEffect(damage, shooter.character);

					takeDamageService(room, user, damage, shooter);

					// 4. 공통: 처리 후 상태 복구
					if (user.character.stateInfo) {
						user.character.changeState();
					}
					if (shooter.character.stateInfo) {
						shooter.character.changeState();
						shooter.character.bbangCount += 1;
					}

					break;
				}

				case CharacterStateType.BIG_BBANG_TARGET: {
					const shooterId = user.character.stateInfo.stateTargetUserId;
					const shooter = room.users.find((u) => u.id === shooterId);
					takeDamageService(room, user, 1, shooter!);
					user.character.changeState();
					room = CheckBigBbangService(room);
					break;
				}
				case CharacterStateType.GUERRILLA_TARGET: {
					const shooterId = user.character.stateInfo.stateTargetUserId;
					const shooter = room.users.find((u) => u.id === shooterId);
					takeDamageService(room, user, 1, shooter!);
					user.character.changeState();
					room = CheckGuerrillaService(room);
					break;
				}
				case CharacterStateType.DEATH_MATCH_TURN_STATE:
					// 현피 차례에서 빵야! 카드가 없을 때만 호출됨
					await handleDeathMatchFailure(room, user);
					break;
				case CharacterStateType.DEATH_MATCH_STATE:
					// 현피 대기 상태에서는 아무것도 하지 않음
					break;
			}
		}
	}
	const toRoom = room.toData();

	const userUpdateNotificationPacket = userUpdateNotificationPacketForm(toRoom.users);
	broadcastDataToRoom(
		toRoom.users,
		userUpdateNotificationPacket,
		GamePacketType.userUpdateNotification,
	);

	return {
		success: true,
		failcode: GlobalFailCode.NONE_FAILCODE,
	};
};

// 현피 실패 처리 (빵야! 카드 없음)
const handleDeathMatchFailure = async (room: any, user: any) => {
	// 현피 종료 (양쪽 상태 초기화)
	const targetUserId = user.character.stateInfo.stateTargetUserId;
	const target = room.users.find((u: any) => u.id === targetUserId);

	// 패배 처리
	takeDamageService(room, user, 1, target);

	if (target && target.character) {
		// 사용자 상태 초기화
		user.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
		user.character.stateInfo.stateTargetUserId = '0';

		// 대상 상태 초기화
		target.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
		target.character.stateInfo.stateTargetUserId = '0';
	}
};
