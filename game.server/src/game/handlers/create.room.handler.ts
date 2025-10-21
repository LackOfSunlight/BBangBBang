import { GameSocket } from '@common/types/game.socket';
import { GamePacket } from '@core/generated/gamePacket';
import { getGamePacketType } from '@common/converters/type.form';
import { GamePacketType, gamePackTypeSelect } from '@game/enums/gamePacketType';
import createRoomUseCase from '@game/usecases/create.room/create.room.usecase';
import { sendData } from '@core/network/sockets/send.data';

const createRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.createRoomRequest);
	if (!payload || !socket.userId) return;

	const req = payload.createRoomRequest;

	const res = await createRoomUseCase(socket, req);

	sendData(socket, res, GamePacketType.createRoomResponse);
};

export default createRoomHandler;
