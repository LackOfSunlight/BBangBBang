import roomManger from '../managers/room.manager';
import { Room } from '../models/room.model';
import { User } from '../models/user.model';

export const applyCardUseHandler = (
	roomId: number,
	userId: string,
	targetId: string,
): { room: Room; user: User; target: User } => {
	const room = roomManger.getRoom(roomId);
	const user = roomManger.getUserFromRoom(roomId, userId);
	if (targetId != '0') {
		const target = roomManger.getUserFromRoom(roomId, targetId);
		return { room, user, target };
	} else {
		const target = {
			id: '0',
			nickname: 'none',
		};
		return { room, user, target };
	}
};
