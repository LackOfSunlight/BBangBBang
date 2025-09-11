import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import { CharacterStateType, GlobalFailCode, ReactionType, CardType } from '../../generated/common/enums.js';
import reactionResponseHandler from '../response/reaction.response.handler.js';
import { getRoom, saveRoom, updateCharacterFromRoom } from '../../utils/redis.util.js';
import userUpdateNotificationHandler from '../notification/user.update.notification.handler.js';
import { setUserUpdateNotification } from './use.card.request.handler.js';
import { getSocketByUserId } from '../../managers/socket.manger.js';
import { CheckBigBbangService } from '../../services/bigbbang.check.service.js';
import { CheckGuerrillaService } from '../../services/guerrilla.check.service.js';

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
		if (user != null) {
			switch (user.character?.stateInfo?.state) {
				case CharacterStateType.BBANG_TARGET:
					// 방어 카드 보유 확인을 위한 정보 가져오기
					const haveShieldCard = user.character.handCards.find(c => c.type === CardType.SHIELD);

					// 발사자 의 장비확인을 위한 발사자 정보 가져오기
					const shooterId = user.character.stateInfo.stateTargetUserId;
					const shooter = room.users.find((u) => u.id === shooterId);
					if(!shooter || !shooter.character || !shooter.character.stateInfo ) break;

                    // 자동 쉴드 방어 로직
                    if (user.character.equips.includes(CardType.AUTO_SHIELD)) {
                        if (Math.random() < 0.25) { // 25% 확률로 방어
                            // 방어에 성공했으므로 HP 감소 없이 종료
                            break;
                        }
                    }
					
					// 방어 카드를 보유하고 있는지에 따라 결과 다르게 처리
					if(haveShieldCard && haveShieldCard.count > 0){
						if(shooter.character.equips.includes(CardType.LASER_POINTER) && haveShieldCard.count > 1){
							// 실드 요구 개수 2개 로 증가
							haveShieldCard.count -= 2; 
						}
						else haveShieldCard.count -= 1;
						
					}
					else user.character.hp -=1; 

					// 처리후 상태 복구
					user.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE; 
					user.character.stateInfo.nextStateAt = '0'; 
					user.character.stateInfo.stateTargetUserId = '0'; 

					shooter.character.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE; 
					shooter.character.stateInfo.nextStateAt = '0'; 
					shooter.character.stateInfo.stateTargetUserId = '0';
					
					break;

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
}

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
	};
}

export default reactionRequestHandler;
