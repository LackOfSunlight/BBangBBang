// cardType = 21
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';
import { CardType, CharacterStateType } from '../generated/common/enums.js';



// 디버프 적용 처리 로직
const cardContainmentUnitEffect = async (roomId: number, userId: string, targetUserId: string) => {
	const user = await getUserFromRoom(roomId, userId);
	const target = await getUserFromRoom(roomId, targetUserId);
	// 유효성 검증
	if (!user || !target || !target.character) return;

	target.character.debuffs.push(CardType.CONTAINMENT_UNIT);
	//console.log(`유저 ${targetUserId}가 감금장치 카드에 맞았습니다.\n다음 차례부터 감금장치에 영향을 받습니다.`);

	// 수정 정보 갱신
	try{
		await updateCharacterFromRoom(roomId, targetUserId, target.character);
		//console.log('로그 저장에 성공하였습니다');
	} catch(error){
		console.error(`로그 저장에 실패하였습니다:[${error}]`);
	}
};

export const debuffContainmentUnitEffect = async (roomId:number, userId: string) => {
	// 이름은 user지만 일단은 debuff targetUser의 정보
	const user = await getUserFromRoom(roomId, userId); 
	if (!user || !user.character) return;

	const escapeProb = 25; // 탈출 확률
	// 첫날은 탈출 불가
	if(user.character.debuffs.includes(CardType.CONTAINMENT_UNIT)){
		if(user.character.stateInfo!.state === CharacterStateType.NONE_CHARACTER_STATE){
			user.character.stateInfo!.state = CharacterStateType.CONTAINED;
		}
		else if(user.character.stateInfo!.state === CharacterStateType.CONTAINED){
			const yourProb = Math.random()*100;
			if(yourProb < escapeProb){ // 탈출에 성공하면 디버프 상태 해제
				user.character.stateInfo!.state = CharacterStateType.NONE_CHARACTER_STATE;
				const yourDebuffIndex = user.character.debuffs.findIndex(c => c === CardType.CONTAINMENT_UNIT );
				user.character.debuffs.splice(yourDebuffIndex, 1);
				return ;
			} 
		}
	}
	

	// 수정 정보 갱신
	try{
		await updateCharacterFromRoom(roomId, userId, user.character);
		//console.log('로그 저장에 성공하였습니다');
	} catch(error){
		console.error(`로그 저장에 실패하였습니다:[${error}]`);
	}

}
export default cardContainmentUnitEffect;

