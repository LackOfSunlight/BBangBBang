import { handleError } from '../handlers/handleError.js';
import { removeSocket } from '../managers/socket.manger.js';
import { GameSocket } from '../type/game.socket.js';
import { removeTokenUserDB } from '../services/prisma.service.js';
import { deleteRoom, getRoom, removeUserFromRoom } from '../utils/room.utils.js';


const onEnd = (socket: GameSocket) => async () => {
	try {
		console.log('클라이언트 연결이 종료되었습니다.');
		removeSocket(socket);

		if (socket.userId) {
			await removeTokenUserDB(Number(socket.userId));
		}

		if (socket.roomId) {
			
			// await removeUserFromRoom();
			removeUserFromRoom(Number(socket.roomId), socket.userId!);
			const room = getRoom(Number(socket.roomId));
			if (room!.users.length <= 0) {
				deleteRoom(Number(socket.roomId));
			}
		}
	} catch (error) {
		handleError(socket, error);
	}
};

export default onEnd;
