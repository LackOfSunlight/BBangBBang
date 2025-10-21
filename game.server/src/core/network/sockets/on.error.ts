import CustomError from '@common/errors/custom.error.js';
import { handleError } from '@core/network/handlers/handleError.js';
import { GameSocket } from '@common/types/game.socket.js';
import socketManger from '@game/managers/socket.manger.js';
import { removeTokenUserDB } from '@game/services/prisma.service.js';

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
