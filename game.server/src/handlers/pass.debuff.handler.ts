import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../utils/type.converter';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import { sendData } from '../utils/send.data';
import passDebuffUseCase from '../useCase/pass.debuff/pass.debuff.usecase';
import { C2SPassDebuffRequest } from '../generated/packet/game_actions';
import { GlobalFailCode } from '../generated/common/enums';

const passDebuffHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.passDebuffRequest);
	if (!payload) return;

	// 잘못된 요청인 경우 UseCase를 호출하지 않음
	if (!socket.userId || !socket.roomId) {
		console.warn('[PassDebuff] 잘못된 소켓 정보:', { userId: socket.userId, roomId: socket.roomId });
		return;
	}

	const req = payload.passDebuffRequest as C2SPassDebuffRequest;

	try {
		// UseCase 호출
		const response = await passDebuffUseCase(socket, req);

		// 요청자에게 응답 전송
		sendData(socket, response, GamePacketType.passDebuffResponse);
	} catch (error) {
		console.error('[PassDebuff] UseCase 실행 중 오류 발생:', error);
		
		// 에러 발생 시 실패 응답 전송
		const errorResponse = {
			payload: {
				oneofKind: GamePacketType.passDebuffResponse,
				passDebuffResponse: {
					success: false,
					failCode: GlobalFailCode.UNKNOWN_ERROR,
				},
			},
		};
		
		sendData(socket, errorResponse, GamePacketType.passDebuffResponse);
	}
};

export default passDebuffHandler;
