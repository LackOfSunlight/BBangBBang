import { GameSocket } from '@common/types/game.socket';
import { GamePacket } from '@core/generated/gamePacket';
import { getGamePacketType } from '@common/converters/type.form';
import { GamePacketType, gamePackTypeSelect } from '@game/enums/gamePacketType';
import { sendData } from '@core/network/sockets/send.data';
import passDebuffUseCase from '@game/usecases/pass.debuff/pass.debuff.usecase';
import { C2SPassDebuffRequest } from '@core/generated/packet/game_actions';

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
