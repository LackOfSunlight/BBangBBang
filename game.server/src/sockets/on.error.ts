import { Socket } from 'net';
import CustomError from '../error/custom.error.js';
import { handleError } from '../handlers/handleError.js';
import { GameSocket } from '../type/game.socket.js';
import { removeSocket } from '../managers/socket.manger.js';

const onError = (socket: GameSocket) => async (err: CustomError) => {
	try {
		console.error('소켓 오류:', err);

		// 소켓 에러 시에도 토큰 정리
		removeSocket(socket);

		// TODO: 사용자 토큰 제거 로직 구현 필요
		// if (socket.userId) {
		// 	await removeTokenUserDB(Number(socket.userId));
		// }
	} catch (error) {
		handleError(socket, new CustomError(500, `소켓 오류: ${err.message}`));
	}
};

export default onError;
