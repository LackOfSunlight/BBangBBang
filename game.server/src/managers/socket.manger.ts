import { GameSocket } from '../type/game.socket';

// 전역적으로 연결된 소켓들을 관리하는 Map (userId를 키로 사용)
export const connectedSockets = new Map<string, GameSocket>();

export const addSocket = (socket: GameSocket) => {
	// 사용자가 로그인하여 userId가 확정된 후에 호출되어야 합니다.
	if (socket.userId) {
		connectedSockets.set(socket.userId, socket);
	}
};

export const removeSocket = (socket: GameSocket) => {
	if (socket.userId && connectedSockets.has(socket.userId)) {
		connectedSockets.delete(socket.userId);
	} else {
	}
};

// userId를 통해 특정 소켓을 가져오는 함수
export const getSocketByUserId = (userId: string): GameSocket | undefined => {
	return connectedSockets.get(userId);
};
