// cardType = 5
import { CharacterType, CardType } from '../../generated/common/enums';
import { CharacterData } from '../../generated/common/types';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

const DEFAULT_TARGET_USER_ID = '0'; 

const getMaxHp = (characterType: CharacterType): number => {
	switch (characterType) {
		case CharacterType.RED:
		case CharacterType.SHARK:
		case CharacterType.MALANG:
		case CharacterType.FROGGY:
		case CharacterType.PINK:
		case CharacterType.SWIM_GLASSES:
		case CharacterType.MASK:
			return 4;
		case CharacterType.DINOSAUR:
		case CharacterType.PINK_SLIME:
			return 3;
		default:
			return 4;
	}
};

const cardCall119Effect = (room: Room, user: User, targetUser: User): boolean => {
	// 유효성 검증
	if (!user || !user.character || !room) return false;

	if (targetUser.id !== DEFAULT_TARGET_USER_ID) {
		const maxHp = getMaxHp(user.character.characterType);
		if (user.character.hp >= maxHp) {
			return false;
		}

		healCharacter(user, user.character);
		return true;
	} else {
		const isAllFullHp = room.users.every(
			(u) => u.character && u.character.hp >= getMaxHp(u.character.characterType),
		);
		if (isAllFullHp) return false;

		for (const roomUser of room.users) {
			if (roomUser.id !== user.id && roomUser.character) {
				healCharacter(roomUser, roomUser.character);
			}
		}

		return true;
	}
};

const healCharacter = (targetUser: { id: string; nickname: string }, character: CharacterData) => {
	const maxHp = getMaxHp(character.characterType);

	if (character.hp >= maxHp) {
		return;
	}

	character.hp = Math.min(character.hp + 1, maxHp);
};

export default cardCall119Effect;
