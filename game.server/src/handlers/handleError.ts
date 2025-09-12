import { Socket } from 'net';

export const handleError = (socket: Socket, error: unknown) => {
	try {
		let responseCode: string | undefined;
		let message: string;

		if (typeof error === 'object' && error !== null) {
			const err = error as NodeJS.ErrnoException;
			responseCode = err.code;
			message = err.message;

			if (err.code) {
				console.error(
					`${err.name}\r\nCode: ${err.code}\r\nMessage: ${err.message}\r\n${err.stack}`,
				);
			} else {
				console.error(`${err.name}\r\nMessage: ${err.message}\r\n${err.stack}`);
			}
		} else {
			console.error('Unknown error:', error);
		}
	} catch (err) {
		console.error('Error in errorHandler:', err);
	}
};
