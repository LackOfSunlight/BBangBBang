import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../utils/type.converter';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import { sendData } from '../utils/send.data';
import passDebuffUseCase from '../useCase/pass.debuff/pass.debuff.usecase';
import { C2SPassDebuffRequest } from '../generated/packet/game_actions';

const passDebuffHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.passDebuffRequest);
	if (!payload) return;

	const req = payload.passDebuffRequest as C2SPassDebuffRequest;

	// UseCase 호출
	const response = await passDebuffUseCase(socket, req);

	// 요청자에게 응답 전송
	sendData(socket, response, GamePacketType.passDebuffResponse);
};

export default passDebuffHandler;
