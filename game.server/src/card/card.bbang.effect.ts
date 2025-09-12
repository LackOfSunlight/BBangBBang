// cardType = 1
import { getUserFromRoom, saveRoom, updateCharacterFromRoom } from "../utils/redis.util.js";
import { CharacterStateType } from "../generated/common/enums.js";
import { getRoom } from "../utils/redis.util.js";
import { CardType } from "../generated/common/enums.js";

const cardBbangEffect = async (roomId: number, userId: string, targetUserId: string) => {
	// 정보값 가져오기
	const user = await getUserFromRoom(roomId, userId);
	const target = await getUserFromRoom(roomId, targetUserId);
	const room = await getRoom(roomId);

	// 유효성 검증

	if (!room) {
		console.log('방이 존재하지 않습니다.');
		return;
	}

	if (!user || !user.character || !user.character.stateInfo) {
		console.log('사용자 정보가 존재하지 않습니다');
		return;
	}

	if (!target || !target.character || !target.character.stateInfo) {
		console.log('타깃 유저의 정보가 존재하지 않습니다 ');
		return;
	}

	// 타겟 유저가 사망 상태라면 불발 처리
	if (target.character.hp <= 0) {
		console.log('타깃 유저의 체력이 이미 0 입니다.');
		return;
	}
	if (!user || !target || !user.character || !target.character) return;

	// 상태 설정
	user.character.stateInfo.state = CharacterStateType.BBANG_SHOOTER; // 빵야 카드 사용자는 BBANG_SHOOTER 상태가 되고
	user.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
	user.character.stateInfo.nextStateAt = `${Date.now() + 10000}`; //ms
	user.character.stateInfo.stateTargetUserId = targetUserId; // 빵야 카드 사용자는 targetId에 대상자 ID를 기록

    target.character.stateInfo.state = CharacterStateType.BBANG_TARGET; // 빵야 카드 대상자는 BBANG_TARGET 상태가 됩니다
    target.character.stateInfo.nextState = CharacterStateType.NONE_CHARACTER_STATE;
    target.character.stateInfo.nextStateAt = `${Date.now()  + 10000}`; //ms
    target.character.stateInfo.stateTargetUserId = userId;

    console.log(`빵 카드 사용 됨`);

    // 수정 정보 갱신
	try{
		await updateCharacterFromRoom(roomId, userId, user.character)
		await updateCharacterFromRoom(roomId, targetUserId, target.character);
		//console.log('로그 저장에 성공하였습니다');
	} catch(error){
		console.error(`로그 저장에 실패하였습니다:[${error}]`);
	}
};

export default  cardBbangEffect;
