import { GameSocket } from '../../type/game.socket.js';
import { C2SPositionUpdateRequest } from '../../generated/packet/game_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { gamePackTypeSelect } from '../../enums/gamePacketType.js';
import positionUpdateNotificationHandler, {
	setPositionUpdateNotification,
} from '../notification/position.update.notification.handler.js';
import { CharacterPositionData } from '../../generated/common/types.js';
import { notificationCharacterPosition } from '../../managers/game.manager.js';

/**
 * 포지션 업데이트 요청 핸들러
 *
 * 클라이언트의 캐릭터 위치 업데이트 요청을 처리합니다.
 */
const positionUpdateRequestHandler = (socket: GameSocket, gamePacket: GamePacket) => {
	// 1. 기본 검증
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.positionUpdateRequest);
	if (!payload || !socket.userId || !socket.roomId) {
		console.warn(
			`[PositionUpdate] Invalid request - userId: ${socket.userId}, roomId: ${socket.roomId}`,
		);
		return;
	}

	const { positionUpdateRequest: req } = payload;

	// 2. 좌표 데이터 검증
	if (typeof req.x !== 'number' || typeof req.y !== 'number') {
		console.warn(`[PositionUpdate] Invalid coordinates - x: ${req.x}, y: ${req.y}`);
		return;
	}

	// 3. CharacterPositionData 생성
	const pos: CharacterPositionData = {
		id: socket.userId,
		x: req.x,
		y: req.y,
	};

	notificationCharacterPosition.get(socket.roomId)?.set(socket.userId, pos);

	// 4. 모든 플레이어에게 포지션 업데이트 알림 전송
	// positionUpdateNotificationHandler(socket, setPositionUpdateNotification([pos]));
};

export default positionUpdateRequestHandler;
