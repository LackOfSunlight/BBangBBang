import { GameSocket } from '../Type/game.socket';
import { GamePacket } from '../Generated/gamePacket';
import { getGamePacketType } from '../Converter/type.form';
import { gamePackTypeSelect, GamePacketType } from '../Enums/gamePacketType';
import joinRandomRoomUseCase from '../UseCase/join.random.room/join.random.room.usecase';
import { sendData } from '../Sockets/send.data';

const joinRandomRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.joinRandomRoomRequest);

	if (!payload || !socket.userId) return;

	const req = payload.joinRandomRoomRequest;

	const res = await joinRandomRoomUseCase(socket, req);

	sendData(socket, res, GamePacketType.joinRandomRoomResponse);
};

export default joinRandomRoomHandler;
