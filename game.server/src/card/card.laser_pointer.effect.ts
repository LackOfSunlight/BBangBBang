// cardType = 17
import { getUserFromRoom, updateCharacterFromRoom } from '../utils/redis.util.js';
import { CardType } from '../generated/common/enums.js';

const cardLaserPointerEffect = async (roomId: number, userId: string) => {
	const user = await getUserFromRoom(roomId, userId);
	// 유효성 검증
	if (!user || !user.character) return;

	// 중복 착용 중일 경우
	if (CardType.LASER_POINTER in user.character.equips) {
		const haveLaserPointerCard = user.character.handCards.find(
			(c) => c.type === CardType.LASER_POINTER,
		);
		if (!haveLaserPointerCard) {
			console.log('잘못된 카드 형식입니다.');
			return;
		} else haveLaserPointerCard.count++; // 카드 복구
		return;
	} else {
		user.character.equips.push(CardType.LASER_POINTER);
	}

	// 수정 정보 갱신
	try{
		await updateCharacterFromRoom(roomId, userId, user.character);
		//console.log('로그 저장에 성공하였습니다');
	} catch(error){
		console.error(`로그 저장에 실패하였습니다:[${error}]`);
	}
};

export default cardLaserPointerEffect;
