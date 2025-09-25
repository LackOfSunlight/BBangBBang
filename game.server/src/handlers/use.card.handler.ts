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
import { getRoom } from '../utils/room.utils';
import { sendData } from '../sockets/send.data';
import { getGamePacketType } from '../converter/type.form';

const useCardHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	/// 1. DTO 생성 및 기본 유효성 검사
	const { userId, roomId } = socket;
	if (!userId || !roomId) {
		// DTO가 유효하지 않으면 즉시 에러 응답
		is_invalid_request(socket, GlobalFailCode.INVALID_REQUEST);
		return;
	}

	const room: Room | null = getRoom(roomId);
	if (!room) {
		is_invalid_request(socket, GlobalFailCode.ROOM_NOT_FOUND);
		return;
	}

	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.useCardRequest);
	if (!payload) {
		is_invalid_request(socket, GlobalFailCode.INVALID_REQUEST);
		return;
	}

	const req = payload.useCardRequest;
	const cardType = req.cardType;
	const targetUserId = req.targetUserId;

	// 카드 타입 검증
	if (req.cardType === CardType.NONE) {
		console.warn(`[useCardRequestHandler] 잘못된 카드 타입 요청: NONE`);
		is_invalid_request(socket, GlobalFailCode.INVALID_REQUEST);
		return;
	}

	/// 2. 유즈케이스 호출
	const res = useCardUseCase(userId, roomId, cardType, targetUserId);

	/// 3. 유즈케이스 결과에 따라 응답/알림 전송
	const useCardResponsePacket = useCardResponsePacketForm(res.success, res.failcode);
	sendData(socket, useCardResponsePacket, GamePacketType.useCardResponse);

	if (res.success) {
		const userUpdateNotificationPacket = userUpdateNotificationPacketForm(room.users);
		broadcastDataToRoom(
			room.users,
			userUpdateNotificationPacket,
			GamePacketType.userUpdateNotification,
		);
	}
};

/** 오류코드:잘못된요청을 일괄 처리하기 위한 함수 */
const is_invalid_request = (socket: GameSocket, failcode: GlobalFailCode) => {
	const wrongDTO = useCardResponsePacketForm(false, failcode);
	sendData(socket, wrongDTO, GamePacketType.useCardResponse);
};

export default useCardHandler;
