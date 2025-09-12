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

	// 수정 정보 갱신
	try {
		await updateCharacterFromRoom(roomId, userId, user.character);
	//console.log('로그 저장에 성공하였습니다');
	} catch(error){
		console.error(`로그 저장에 실패하였습니다:[${error}]`);
	}
};

export default cardAutoRifleEffect;
