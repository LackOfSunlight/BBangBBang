import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../utils/type.converter';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import joinRoomUseCase from '../useCase/join.room/join.room.usecase';
import { sendData } from '../utils/send.data.js';
import { broadcastDataToRoom } from '../utils/notification.util.js';
import { getRoom } from '../utils/room.utils.js';

const joinRoomRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.joinRoomRequest);

	if (!payload || !socket.userId) return;

	const req = payload.joinRoomRequest;

	const res = await joinRoomUseCase(socket, req);

	sendData(socket, res, GamePacketType.joinRoomResponse);
};

export default joinRoomRequestHandler;
