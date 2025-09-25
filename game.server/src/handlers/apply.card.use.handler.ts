import { Room } from '../models/room.model';
import { User } from '../models/user.model';
import { getRoom, getUserFromRoom } from '../utils/room.utils';

export const applyCardUseHandler = (
	roomId: number,
	userId: string,
	targetId: string,
): { room: Room; user: User; target: User | null } => {
	let target;

	const room = getRoom(roomId);
	const user = getUserFromRoom(roomId, userId);
	if (targetId) {
		target = getUserFromRoom(roomId, targetId);
	} else {
		target = null;
	}

	return { room, user, target };
};
