import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import {
	CharacterStateType,
	GlobalFailCode,
	ReactionType,
	CardType,
} from '../../generated/common/enums.js';
import reactionResponseHandler from '../response/reaction.response.handler.js';
import { getRoom, saveRoom, updateCharacterFromRoom } from '../../utils/redis.util.js';
import userUpdateNotificationHandler from '../notification/user.update.notification.handler.js';
import { setUserUpdateNotification } from './use.card.request.handler.js';
import { CheckBigBbangService } from '../../services/bigbbang.check.service.js';
import { CheckGuerrillaService } from '../../services/guerrilla.check.service.js';
import { weaponDamageEffect } from '../../utils/weapon.util.js';

const reactionRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.reactionRequest);

	if (!payload || !socket.userId || !socket.roomId) {
		return reactionResponseHandler(
			socket,
			setReactionResponse(false, GlobalFailCode.INVALID_REQUEST),
		);
	}

	const req = payload.reactionRequest;

	let room = await getRoom(socket.roomId);

	if (!room) {
		return reactionResponseHandler(
			socket,
			setReactionResponse(false, GlobalFailCode.ROOM_NOT_FOUND),
		);
	}

	if (req.reactionType === ReactionType.NONE_REACTION) {
		const user = room.users.find((u) => u.id === socket.userId);
		console.log(`유저id:${user?.id}`);
		if (user != null && user.character && user.character.stateInfo) {
			switch (user.character.stateInfo.state) {
				case CharacterStateType.BBANG_TARGET: {
					// 피격자(user)와 공격자(shooter) 정보 확인
					const shooterId = user.character.stateInfo.stateTargetUserId;
					const shooter = room.users.find((u) => u.id === shooterId);
					if (!shooter || !shooter.character) break;

					let isDefended = false;

					// 1. 자동 쉴드 방어 시도 (공격자가 레이저 포인터를 사용하지 않았을 때만)
					const shooterHasLaser = shooter.character.equips.includes(CardType.LASER_POINTER);
					if (!shooterHasLaser && user.character.equips.includes(CardType.AUTO_SHIELD)) {
						if (Math.random() < 0.25) {
							isDefended = true; // 25% 확률로 방어 성공
						}
					}

					// 2. 쉴드 카드 방어 시도 (아직 방어하지 못했다면)
					if (!isDefended) {
						const haveShieldCard = user.character.handCards.find((c) => c.type === CardType.SHIELD);
						const requiredShields = shooterHasLaser ? 2 : 1;

						if (haveShieldCard && haveShieldCard.count >= requiredShields) {
							haveShieldCard.count -= requiredShields; // 쉴드 카드로 방어 성공
							isDefended = true;
						}
					}

					// 3. 방어 최종 실패 시 데미지 적용
					if (!isDefended) {
						let damage = 1; // 기본 데미지
						damage = weaponDamageEffect(damage, shooter.character);
						user.character.hp -= damage;
					}

					// 4. 공통: 처리 후 상태 복구
					if (user.character.stateInfo) {
						user.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
						user.character.stateInfo.nextStateAt = '0';
						user.character.stateInfo.stateTargetUserId = '0';
					}
					if (shooter.character.stateInfo) {
						shooter.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
						shooter.character.stateInfo.nextStateAt = '0';
						shooter.character.stateInfo.stateTargetUserId = '0';
					}

					break;
				}

				case CharacterStateType.BIG_BBANG_TARGET:
					user.character.hp -= 1;
					user.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
					user.character.stateInfo.nextStateAt = '0';
					user.character.stateInfo.stateTargetUserId = '0';
					room = await CheckBigBbangService(room);
					break;
				case CharacterStateType.GUERRILLA_TARGET:
					user.character.hp -= 1;
					user.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
					user.character.stateInfo.nextStateAt = '0';
					user.character.stateInfo.stateTargetUserId = '0';
					room = await CheckGuerrillaService(room);
					break;
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
	await saveRoom(room);

	reactionResponseHandler(socket, setReactionResponse(true, GlobalFailCode.NONE_FAILCODE));
	await userUpdateNotificationHandler(socket, setUserUpdateNotification(room.users));
};

const setReactionResponse = (success: boolean, failCode: GlobalFailCode): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.reactionResponse,
			reactionResponse: {
				success,
				failCode,
			},
		},
	};
	return newGamePacket;
};

// 현피 실패 처리 (빵야! 카드 없음)
const handleDeathMatchFailure = async (room: any, user: any) => {
	// 패배 처리
	user.character.hp -= 1;

	// 현피 종료 (양쪽 상태 초기화)
	const targetUserId = user.character.stateInfo.stateTargetUserId;
	const target = room.users.find((u: any) => u.id === targetUserId);

	if (target && target.character) {
		// 사용자 상태 초기화
		user.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
		user.character.stateInfo.stateTargetUserId = '0';

		// 대상 상태 초기화
		target.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;
		target.character.stateInfo.stateTargetUserId = '0';

		// Redis 업데이트
		try {
			await updateCharacterFromRoom(room.id, user.id, user.character);
			await updateCharacterFromRoom(room.id, target.id, target.character);
			console.log(
				`[현피] ${user.nickname} 패배! 체력: ${user.character.hp + 1} → ${user.character.hp}`,
			);
		} catch (error) {
			console.error(`[현피] Redis 업데이트 실패:`, error);
		}
	}
};

export default reactionRequestHandler;
