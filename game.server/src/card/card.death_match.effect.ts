// cardType = 6
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';
import { CardType, CharacterStateType } from '../generated/common/enums.js';

const cardDeathMatchEffect = async (roomId: number, userId: string, targetUserId: string) : Promise<boolean> => {
	const user = await getUserFromRoom(roomId, userId);

	// 유효성 검증
	if (!user || !user.character) return false;

	const target = await getUserFromRoom(roomId, targetUserId);

	// 유효성 검증
	if (!target || !target.character) return false;

	const isBbangCard: boolean = user.character.handCards.some(c => c.type === CardType.BBANG);

	if(!isBbangCard) {
		console.log("빵야 카드가 없습니다");
		return false;
	}

	// 현피 카드 효과: 현피 상태 설정
	// 사용자: DEATH_MATCH_TURN_STATE (현피 차례)
	// 대상: DEATH_MATCH_STATE (현피 대기)

	user.character.stateInfo = {
		state: CharacterStateType.DEATH_MATCH_TURN_STATE,
		nextState: CharacterStateType.NONE_CHARACTER_STATE,
		nextStateAt: '0',
		stateTargetUserId: targetUserId,
	};

	target.character.stateInfo = {
		state: CharacterStateType.DEATH_MATCH_STATE,
		nextState: CharacterStateType.NONE_CHARACTER_STATE,
		nextStateAt: '0',
		stateTargetUserId: userId,
	};

	// Redis에 업데이트된 캐릭터 정보 저장
	try {
		await updateCharacterFromRoom(roomId, userId, user.character);
		await updateCharacterFromRoom(roomId, targetUserId, target.character);
		console.log(`[현피] ${user.nickname}이 ${target.nickname}에게 현피를 걸었습니다.`);
		return true
	} catch (error) {
		console.error(`[현피] Redis 업데이트 실패:`, error);
		return false;
	}
};

export default cardDeathMatchEffect;
