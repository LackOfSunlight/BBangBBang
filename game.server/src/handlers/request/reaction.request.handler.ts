import { GameSocket } from '../../type/game.socket.js';
import { C2SReactionRequest } from '../../generated/packet/game_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { CharacterStateType } from '../../generated/common/enums.js';
import { getRoom, updateCharacterFromRoom } from '../../utils/redis.util.js';

const reactionRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	if (!socket.roomId) return;

	const room = await getRoom(socket.roomId);
	if (!room) return;

	const user = room.users.find((u) => u.id === socket.userId);
	if (!user || !user.character) return;

	switch (user.character.stateInfo?.state) {
		case CharacterStateType.DEATH_MATCH_TURN_STATE:
			// 현피 차례에서 빵야! 카드가 없을 때만 호출됨
			await handleDeathMatchFailure(room, user);
			break;

		case CharacterStateType.DEATH_MATCH_STATE:
			// 현피 대기 상태에서는 아무것도 하지 않음
			break;
	}
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
