import { Socket } from 'net';
import { handleError } from '../handlers/handleError.js';
import { removeSocket } from '../managers/socket.manger.js';
import leaveRoomRequestHandler from '../handlers/request/leave.room.request.handler.js';
import { removeUserFromRoom } from '../utils/redis.util.js';
import { GameSocket } from '../type/game.socket.js';

const onEnd = (socket: GameSocket) => async () => {
	try {
		console.log('클라이언트 연결이 종료되었습니다.');
		removeSocket(socket);
		removeUserFromRoom(Number(socket.roomId), socket.userId!);
	} catch (error) {
		handleError(socket, error);
	}
};

export default onEnd;
