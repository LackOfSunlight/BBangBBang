import { GameSocket } from '../Type/game.socket';
import { GamePacket } from '../Generated/gamePacket';
import { getGamePacketType } from '../Converter/type.form';
import { GamePacketType, gamePackTypeSelect } from '../Enums/gamePacketType';
import createRoomUseCase from '../UseCase/Create.room/create.room.usecase';
import { sendData } from '../Sockets/send.data';

const createRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.createRoomRequest);
	if (!payload || !socket.userId) return;

	const req = payload.createRoomRequest;

	const res = await createRoomUseCase(socket, req);

	sendData(socket, res, GamePacketType.createRoomResponse);
};

export default createRoomHandler;
