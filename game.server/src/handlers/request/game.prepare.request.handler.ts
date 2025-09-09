import { GameSocket } from '../../type/game.socket.js';
import { C2SGamePrepareRequest } from '../../generated/packet/game_actions.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import gamePrepareResponseHandler from '../response/game.prepare.response.handler.js';
import { GlobalFailCode, RoomStateType } from '../../generated/common/enums.js';
import { getRoom, saveRoom } from '../../utils/redis.util.js';
import gamePrepareNotificationHandler from '../notification/game.prepare.notification.handler.js';
import { Room } from '../../models/room.model.js';

const gamePrepareRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.gamePrepareRequest);
	if (!payload) return;

	const roomId = socket.roomId;
	if (!socket.userId || !roomId) {
		await gamePrepareResponseHandler(
			socket,
			setGamePrepareResponse(false, GlobalFailCode.INVALID_REQUEST),
		);
		return;
	}
	try {
		const room = await getRoom(roomId);
		if (!room) {
			await gamePrepareResponseHandler(
				socket,
				setGamePrepareResponse(false, GlobalFailCode.ROOM_NOT_FOUND),
			);
			return;
		}

		// 방장만 게임을 준비할 수 있습니다.
		if (room.ownerId !== socket.userId) {
			await gamePrepareResponseHandler(
				socket,
				setGamePrepareResponse(false, GlobalFailCode.NOT_ROOM_OWNER),
			);
			return;
		}

		// Redis에서 방 상태를 업데이트합니다.
		room.state = RoomStateType.PREPARE;
		await saveRoom(room);

		// 요청자에게 성공 응답을 보냅니다.
		await gamePrepareResponseHandler(
			socket,
			setGamePrepareResponse(true, GlobalFailCode.NONE_FAILCODE),
		);

		// 방의 모든 플레이어에게 알림을 보냅니다.
		await gamePrepareNotificationHandler(socket, setGameNotification(room));
	} catch (error) {
		console.error('게임 준비 중 오류 발생:', error);
		await gamePrepareResponseHandler(
			socket,
			setGamePrepareResponse(true, GlobalFailCode.UNKNOWN_ERROR),
		);
	}
};

const setGamePrepareResponse = (success: boolean, failCode: GlobalFailCode): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.joinRoomResponse,
			joinRoomResponse: {
				success,
				failCode,
			},
		},
	};
	return newGamePacket;
};

const setGameNotification = (room: Room): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.gamePrepareNotification,
			gamePrepareNotification: {
				room,
			},
		},
	};
	return newGamePacket;
};

export default gamePrepareRequestHandler;
