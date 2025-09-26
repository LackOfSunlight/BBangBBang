import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../converter/type.form';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import { reactionUpdateUseCase } from '../useCase/reaction.update/reaction.update.usecase';
import { sendData } from '../sockets/send.data';
import { checkAndEndGameIfNeeded } from '../services/game.end.service';
import { Room } from '../models/room.model';
import { GlobalFailCode } from '../generated/common/enums';
import { reactionResponsePacketForm } from '../converter/packet.form';
import roomManger from '../managers/room.manager';

const reactionUpdateHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	if (!socket.roomId) {
		// DTO가 유효하지 않으면 즉시 에러 응답
		invalidRequest(socket, GlobalFailCode.INVALID_REQUEST);
		return;
	}

	const room: Room | null = roomManger.getRoom(socket.roomId);
	if (!room) {
		invalidRequest(socket, GlobalFailCode.ROOM_NOT_FOUND);
		return;
	}

	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.reactionRequest);
	if (!payload) {
		invalidRequest(socket, GlobalFailCode.INVALID_REQUEST);
		return;
	}

	const reactionType = payload.reactionRequest.reactionType;

	/// 2. 유즈케이스 호출
	const res = await reactionUpdateUseCase(socket, reactionType);

	/// 3. 유즈케이스 결과에 따라 응답/알림 전송
	const responsePacket = reactionResponsePacketForm(res.success, res.failcode);
	sendData(socket, responsePacket, GamePacketType.reactionResponse);

	// 게임 종료 조건 검사
	await checkAndEndGameIfNeeded(room.id);
};

/** 오류코드:잘못된요청 을 일괄 처리하기 위한 함수 */
const invalidRequest = (socket: GameSocket, failcode: GlobalFailCode) => {
	const wrongDTO = reactionResponsePacketForm(false, failcode);
	sendData(socket, wrongDTO, GamePacketType.useCardResponse);
};

export default reactionUpdateHandler;
