import { CardType } from '../../generated/common/enums';
import { cardManager } from '../../managers/card.manager';
import getMaxHp from '../../utils/character.util';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';

const cardVaccineEffect = (roomId: number, userId: string): boolean => {
	try {
		const user = getUserFromRoom(roomId, userId);
		let room = getRoom(roomId);

		if (!room) return false;

		// 유효성 검증 (캐릭터 존재 여부)
		if (!user.character) {
			console.warn(`[백신] 유저의 캐릭터 정보가 없습니다: ${userId}`);
			return false;
		}

		const maxHp = getMaxHp(user.character.characterType);
		if (user.character.hp >= maxHp) {
			console.log(`체력이 최대치(${maxHp})에 도달하여 더이상 회복 할 수 없습니다.`);
			return false;
		}

		cardManager.removeCard(user, room, CardType.VACCINE);

		const previousHp = user.character.hp;
		user.character.hp = Math.min(user.character.hp + 1, maxHp);

		updateCharacterFromRoom(roomId, user.id, user.character);
		console.log(
			`[백신 사용] ${user.nickname}의 체력이 ${previousHp} → ${user.character.hp}로 회복되었습니다. (최대: ${maxHp})`,
		);
		return true;
	} catch (error) {
		console.error(`[백신] 처리 중 오류 발생:`, error);
		return false;
	}
};
export default cardVaccineEffect;
