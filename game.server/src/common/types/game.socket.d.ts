import { Socket } from 'net';

export interface GameSocket extends Socket {
	userId?: string;
	roomId?: number;
}
