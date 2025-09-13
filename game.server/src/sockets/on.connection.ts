import { Socket } from 'net';
import { cleanupSocketBuffer, onData } from './on.data.js';
import onEnd from './on.end.js';
import onError from './on.error.js';

const onConnection = (socket: Socket) => {
	socket.on('data', (chunk: Buffer) => onData(socket, chunk));
	socket.on('end', () => {
		cleanupSocketBuffer(socket);
		onEnd(socket);
	});
	socket.on('error', (error) => {
		cleanupSocketBuffer(socket);

		// onError는 onError(socket)로 실행하면 (customError: CustomError) => void 같은 함수를 돌려주는 구조
		const customError = {
			...error,
			code: (error as any).code || 'SOCKET_ERROR',
		};
		onError(socket)(customError);
	});
	socket.on('close', () => {
		cleanupSocketBuffer(socket);
	});
};

export default onConnection;
