import { Socket } from 'net';
import jmeterTestHandler from '../handlers/jmeter.test.handler';

const onJmeterConnection = (socket: Socket) => {
	let buffer = '';

	socket.on('data', (chunk) => {
		buffer += chunk.toString('utf8');

		let idx;
		while ((idx = buffer.indexOf('\n')) >= 0) {
			const command = buffer.slice(0, idx).trim();
			buffer = buffer.slice(idx + 1);

			if (command.length > 0) {
				jmeterTestHandler(socket, command);
			}
		}
	});
};

export default onJmeterConnection;
