import roomManager from '../managers/room.manager';
import { Room } from '../models/room.model';
import { User } from '../models/user.model';

export const applyCardUseHandler = (
	roomId: number,
	userId: string,
	targetId: string,
): { room: Room; user: User; target: User } => {
	let target: User;

	const room = roomManager.getRoom(roomId);
	const user = roomManager.getUserFromRoom(roomId, userId);
	if (targetId) {
		target = roomManager.getUserFromRoom(roomId, targetId);
	} else {
		target = {
			id: '0',
			nickname: 'none',
		};
	}

	return { room, user, target };
};
