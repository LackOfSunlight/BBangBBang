import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { getGamePacketType } from '../converter/type.form';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import { sendData } from '../sockets/send.data';
import getRoomListUseCase from '../useCase/get.room.list/get.room.list.usecase';

const getRoomListHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.getRoomListRequest);

	if (!payload || !socket.userId) return;

	const req = payload.getRoomListRequest;

	const res = getRoomListUseCase(socket, req);

	sendData(socket, res, GamePacketType.getRoomListResponse);
};

export default getRoomListHandler;
