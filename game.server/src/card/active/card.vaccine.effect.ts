import { CardType } from '../../generated/common/enums';
import { cardManager } from '../../managers/card.manager';
import getMaxHp from '../../init/character.Init';
import { User } from '../../models/user.model';
import { Room } from '../../models/room.model';

const cardVaccineEffect = (room: Room, user: User, ): boolean => {
	if (!user || !room) return false;

	// 유효성 검증 (캐릭터 존재 여부)
	if (!user.character) {
		console.warn(`[백신] 유저의 캐릭터 정보가 없습니다: ${user}`);
		return false;
	}

	const maxHp = getMaxHp(user.character.characterType);
	if (user.character.hp >= maxHp) {
		console.log(`체력이 최대치(${maxHp})에 도달하여 더이상 회복 할 수 없습니다.`);
		return false;
	}

	cardManager.removeCard(user, room, CardType.VACCINE);
	user.character.hp = Math.min(user.character.hp + 1, maxHp);

	console.log(`(${user.nickname})백신 카드를 사용했습니다.`);
	return true;
};
export default cardVaccineEffect;
