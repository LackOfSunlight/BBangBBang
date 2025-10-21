import { GameSocket } from '@common/types/game.socket';

// 전역적으로 연결된 소켓들을 관리하는 Map (userId를 키로 사용)
export const connectedSockets = new Map<string, GameSocket>();

class SocketManager {
	private static instance: SocketManager;

	public static getInstance(): SocketManager {
		if (!SocketManager.instance) {
			SocketManager.instance = new SocketManager();
		}
		return SocketManager.instance;
	}

	public addSocket(socket: GameSocket) {
		// 사용자가 로그인하여 userId가 확정된 후에 호출되어야 합니다.
		if (socket.userId) {
			connectedSockets.set(socket.userId, socket);
		}
	}

	public removeSocket(socket: GameSocket) {
		if (socket.userId && connectedSockets.has(socket.userId)) {
			connectedSockets.delete(socket.userId);
		} else {
		}
	}

	// userId를 통해 특정 소켓을 가져오는 함수
	public getSocketByUserId(userId: string): GameSocket | void {
		return connectedSockets.get(userId);
	}
}

export default SocketManager.getInstance();
