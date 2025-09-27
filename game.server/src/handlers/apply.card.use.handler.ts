import { CharacterData } from '../generated/common/types';
import roomManager from '../managers/room.manager';
import { Character } from '../models/character.model';
import { Room } from '../models/room.model';
import { User } from '../models/user.model';

export const applyCardUseHandler = (
	roomId: number,
	userId: string,
	targetId: string,
): { room: Room; user: User; target: User } => {
	const room = roomManager.getRoom(roomId);
	const user = roomManager.getUserFromRoom(roomId, userId);
	console.log('character instanceof Character?', user.character instanceof Character);
	console.log('constructor:', user.character?.constructor?.name);
	const nonTarget = '0';
	if (targetId != '0') {
		const target = roomManager.getUserFromRoom(roomId, targetId);
		return { room, user, target };
	} else {
		const target = {
			id: nonTarget,
			nickname: 'none',
		} as User;
		return { room, user, target };
	}
};
