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
	const nonTarget = '0'
	if (targetId != '0') {
		target = roomManager.getUserFromRoom(roomId, targetId);
	} else {
		target = {
			id: nonTarget,
			nickname: 'none',
		};
	}

	return { room, user, target };
};
