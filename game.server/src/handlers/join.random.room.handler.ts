import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../utils/type.converter';
import { gamePackTypeSelect, GamePacketType } from '../enums/gamePacketType';
import joinRandomRoomUseCase from '../useCase/join.random.room/join.random.room.usecase';
import { sendData } from '../utils/send.data';

const joinRandomRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.joinRandomRoomRequest);

	if (!payload || !socket.userId) return;

	const req = payload.joinRandomRoomRequest;

	const res = await joinRandomRoomUseCase(socket, req);

	sendData(socket, res, GamePacketType.joinRandomRoomResponse);
};

export default joinRandomRoomHandler;
