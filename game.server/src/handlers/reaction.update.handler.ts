import { GameSocket } from '../Type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../Converter/type.form';
import { GamePacketType, gamePackTypeSelect } from '../Enums/gamePacketType';
import { reactionUpdateUseCase } from '../UseCase/reaction.update/reaction.update.usecase';
import { sendData } from '../Sockets/send.data';
import { checkAndEndGameIfNeeded } from '../Services/game.end.service';
import { Room } from '../Models/room.model';
import { GlobalFailCode } from '../generated/common/enums';
import { reactionResponsePacketForm } from '../Converter/packet.form';
import roomManger from '../Managers/room.manager';
import { invalidRequest } from '../Utils/invalid.request';

const reactionUpdateHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	if (!socket.roomId) {
		// DTO가 유효하지 않으면 즉시 에러 응답
		invalidRequest(socket, GlobalFailCode.INVALID_REQUEST, GamePacketType.reactionResponse);
		return;
	}

	const room: Room | null = roomManger.getRoom(socket.roomId);
	if (!room) {
		invalidRequest(socket, GlobalFailCode.ROOM_NOT_FOUND, GamePacketType.reactionResponse);
		return;
	}

	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.reactionRequest);
	if (!payload) {
		invalidRequest(socket, GlobalFailCode.INVALID_REQUEST, GamePacketType.reactionResponse);
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

export default reactionUpdateHandler;
