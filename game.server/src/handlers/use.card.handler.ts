import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import {
	useCardResponsePacketForm,
	userUpdateNotificationPacketForm,
} from '../converter/packet.form';
import { CardType, GlobalFailCode } from '../generated/common/enums';
import { GamePacket } from '../generated/gamePacket';
import { Room } from '../models/room.model';
import { GameSocket } from '../type/game.socket';
import { useCardUseCase } from '../useCase/use.card/use.card.usecase';
import { broadcastDataToRoom } from '../sockets/notification';
import { sendData } from '../sockets/send.data';
import { getGamePacketType } from '../converter/type.form';
import roomManger from '../managers/room.manager';
import { invalidRequest } from '../utils/invalid.request';

const useCardHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	/// 1. DTO 생성 및 기본 유효성 검사
	const { userId, roomId } = socket;
	if (!userId || !roomId) {
		// DTO가 유효하지 않으면 즉시 에러 응답
		invalidRequest(socket, GlobalFailCode.INVALID_REQUEST, GamePacketType.useCardResponse);
		return;
	}

	const room: Room | null = roomManger.getRoom(roomId);
	if (!room) {
		invalidRequest(socket, GlobalFailCode.ROOM_NOT_FOUND, GamePacketType.useCardResponse);
		return;
	}

	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.useCardRequest);
	if (!payload) {
		invalidRequest(socket, GlobalFailCode.INVALID_REQUEST, GamePacketType.useCardResponse);
		return;
	}

	const req = payload.useCardRequest;
	const cardType = req.cardType;
	const targetUserId = req.targetUserId;

	// 카드 타입 검증
	if (req.cardType === CardType.NONE) {
		console.warn(`[useCardRequestHandler] 잘못된 카드 타입 요청: NONE`);
		invalidRequest(socket, GlobalFailCode.INVALID_REQUEST, GamePacketType.useCardResponse);
		return;
	}

	/// 2. 유즈케이스 호출
	const res = useCardUseCase(userId, roomId, cardType, targetUserId);

	if (res.success) {
		const userUpdateNotificationPacket = userUpdateNotificationPacketForm(room.users);
		broadcastDataToRoom(
			room.users,
			userUpdateNotificationPacket,
			GamePacketType.userUpdateNotification,
		);
	}

	/// 3. 유즈케이스 결과에 따라 응답/알림 전송
	const useCardResponsePacket = useCardResponsePacketForm(res.success, res.failcode);
	sendData(socket, useCardResponsePacket, GamePacketType.useCardResponse);
};

export default useCardHandler;
