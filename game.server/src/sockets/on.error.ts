import CustomError from '../Error/custom.error.js';
import { handleError } from '../Handlers/handleError.js';
import { GameSocket } from '../Type/game.socket.js';
import socketManger from '../Managers/socket.manger.js';
import { removeTokenUserDB } from '../Services/prisma.service.js';

const onError = (socket: GameSocket) => async (err: CustomError) => {
	try {
		console.error('소켓 오류:', err);

		// 소켓 에러 시에도 토큰 정리
		socketManger.removeSocket(socket);

		if (socket.userId) {
			await removeTokenUserDB(Number(socket.userId));
		}
	} catch (error) {
		handleError(socket, new CustomError(500, `소켓 오류: ${err.message}`));
	}
};

export default onError;
