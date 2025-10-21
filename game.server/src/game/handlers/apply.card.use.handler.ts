import roomManager from '@game/managers/room.manager';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';

export const applyCardUseHandler = (
	roomId: number,
	userId: string,
	targetId: string,
): { room: Room; user: User; target: User } => {
	const room = roomManager.getRoom(roomId);
	const user = roomManager.getUserFromRoom(roomId, userId);
	if (targetId != process.env.NON_TARGET) {
		const target = roomManager.getUserFromRoom(roomId, targetId);
		return { room, user, target };
	} else {
		const target = {
			id: process.env.NON_TARGET,
			nickname: 'none',
		} as User;
		return { room, user, target };
	}
};
