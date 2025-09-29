import { GameSocket } from '../Type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../Converter/type.form';
import { GamePacketType, gamePackTypeSelect } from '../Enums/gamePacketType';
import { sendData } from '../Sockets/send.data';
import passDebuffUseCase from '../UseCase/Pass.debuff/pass.debuff.usecase';
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
