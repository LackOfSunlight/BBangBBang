import { Socket } from 'net';
import { onData } from './on.data.js';
import onEnd from './on.end.js';
import onError from './on.error.js';

const onConnection = (socket: Socket) => {
	socket.on('data', (chunk: Buffer) => onData(socket, chunk));
	socket.on('end', onEnd(socket));
	socket.on('error', onError(socket));
};

export default onConnection;
