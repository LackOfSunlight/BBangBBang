import { GameSocket } from '../Type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../Converter/type.form';
import { GamePacketType, gamePackTypeSelect } from '../Enums/gamePacketType';
import destroyCardUseCase from '../UseCase/destroy.card/destroy.card.usecase';
import { sendData } from '../Sockets/send.data';

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
