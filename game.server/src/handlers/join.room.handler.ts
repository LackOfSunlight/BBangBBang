import { GameSocket } from '../Type/game.socket';
import { GamePacket } from '../Generated/gamePacket';
import { getGamePacketType } from '../Converter/type.form';
import { GamePacketType, gamePackTypeSelect } from '../Enums/gamePacketType';
import joinRoomUseCase from '../UseCase/Join.room/join.room.usecase';
import { sendData } from '../Sockets/send.data';

const joinRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.joinRoomRequest);

	if (!payload || !socket.userId) return;

	const req = payload.joinRoomRequest;

	const res = await joinRoomUseCase(socket, req);

	sendData(socket, res, GamePacketType.joinRoomResponse);
};

export default joinRoomHandler;
