import { GameSocket } from '../../type/game.socket.js';
import { S2CPositionUpdateNotification } from '../../generated/packet/notifications.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { broadcastDataToRoom } from '../../utils/notification.util.js';
import { getRoom } from '../../utils/redis.util.js';
import { Room } from '../../models/room.model.js';
import { CharacterPositionData } from '../../generated/common/types.js';

/**
 * 포지션 업데이트 알림 핸들러
 *
 * 캐릭터 위치 변경을 모든 플레이어에게 알립니다.
 *
 * 처리 과정:
 * 1. 소켓 roomId 검증
 * 2. 방 정보 조회
 * 3. 포지션 데이터 검증
 * 4. 모든 플레이어에게 알림 전송
 *
 */
const positionUpdateNotificationHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	// 1. 기본 검증
	if (!socket.roomId) {
		console.warn(`[PositionUpdateNotification] No roomId in socket`);
		return;
	}

	// 2. 방 정보 조회
	const room: Room | null = await getRoom(socket.roomId);
	if (!room) {
		console.warn(`[PositionUpdateNotification] Room not found - roomId: ${socket.roomId}`);
		return;
	}

	// 3. 포지션 데이터 검증
	if (gamePacket.payload.oneofKind === 'positionUpdateNotification') {
		const positionData = gamePacket.payload.positionUpdateNotification;

		// characterPositions 배열이 존재하고 비어있지 않은지 확인
		if (!positionData.characterPositions || positionData.characterPositions.length === 0) {
			console.warn(`[PositionUpdateNotification] Empty character positions`);
			return;
		}

		// 각 포지션 데이터 검증
		for (const pos of positionData.characterPositions) {
			if (!pos.id || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
				console.warn(
					`[PositionUpdateNotification] Invalid position data - id: ${pos.id}, x: ${pos.x}, y: ${pos.y}`,
				);
				return;
			}
		}
	}

	// 4. 모든 플레이어에게 알림 전송
	broadcastDataToRoom(room.users, gamePacket, GamePacketType.positionUpdateNotification);
};

export const setPositionUpdateNotification = (
	characterPositions: CharacterPositionData[],
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.positionUpdateNotification,
			positionUpdateNotification: {
				characterPositions,
			},
		},
	};
	return newGamePacket;
};

export default positionUpdateNotificationHandler;
