// cardType = 16
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';
import { CardType } from '../generated/common/enums.js';
import { bbangLimit } from '../utils/weapon.util';

const cardAutoRifleEffect = async (roomId: number, userId: string) => {
	// 정보값 가져오기
	const user = await getUserFromRoom(roomId, userId);
	// 유효성 검증
	if (!user || !user.character || !user.character.stateInfo) return;

	// 소지 카드에서의 제거는 호출함수에서 처리
	user.character.weapon = CardType.AUTO_RIFLE; // 16;AUTO_RIFLE 장착

	/** 보류 */
	// // BbangCount 초기화 : 기존 무기의 강화점 초기화
	// user.character.bbangCount = 1;
	// // 현재 가지고 있는 Bbang 카드 개수 파악 후 bbangCount에 반영
	// const bbangInHands= user.character.handCards.filter(c => c.type === 1).length;
	// user.character.bbangCount = bbangInHands;
	//
	//// 손에 Bbang 카드가 추가될 경우

    // 클라이언트 코드 기준 max값
    // user.character.bbangCount = 99;
    // user.character.bbangCount = bbangLimit(user.character); // 99

	// 수정 정보 갱신
	try {
		await updateCharacterFromRoom(roomId, userId, user.character);
	//console.log('로그 저장에 성공하였습니다');
	} catch(error){
		console.error(`로그 저장에 실패하였습니다:[${error}]`);
	}
};

export default cardAutoRifleEffect;
