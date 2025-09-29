import { CharacterData } from '../generated/common/types';
import roomManager from '../Managers/room.manager';
import { Character } from '../Models/character.model';
import { Room } from '../Models/room.model';
import { User } from '../Models/user.model';

export const applyCardUseHandler = (
	roomId: number,
	userId: string,
	targetId: string,
): { room: Room; user: User; target: User } => {
	const room = roomManager.getRoom(roomId);
	const user = roomManager.getUserFromRoom(roomId, userId);
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
