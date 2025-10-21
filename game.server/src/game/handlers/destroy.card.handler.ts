import { GameSocket } from '@common/types/game.socket';
import { GamePacket } from '@core/generated/gamePacket';
import { getGamePacketType } from '@common/converters/type.form';
import { GamePacketType, gamePackTypeSelect } from '@game/enums/gamePacketType';
import destroyCardUseCase from '@game/usecases/destroy.card/destroy.card.usecase';
import { sendData } from '@core/network/sockets/send.data';

const destroyCardHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.destroyCardRequest);

	if (!payload || !socket.userId || !socket.roomId) {
		console.log('소켓과 패킷이 전달되지 않았습니다.');
		return;
	}

	const req = payload.destroyCardRequest;

	const res = await destroyCardUseCase(socket, req);

	sendData(socket, res, GamePacketType.destroyCardResponse);
};

export default destroyCardHandler;
