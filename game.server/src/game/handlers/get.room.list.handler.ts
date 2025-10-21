import { GameSocket } from '@common/types/game.socket';
import { GamePacket } from '@core/generated/gamePacket';
import { getGamePacketType } from '@common/converters/type.form';
import { GamePacketType, gamePackTypeSelect } from '@game/enums/gamePacketType';
import { sendData } from '@core/network/sockets/send.data';
import getRoomListUseCase from '@game/usecases/get.room.list/get.room.list.usecase';

const getRoomListHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.getRoomListRequest);

	if (!payload || !socket.userId) return;

	const req = payload.getRoomListRequest;

	const res = getRoomListUseCase(socket, req);

	sendData(socket, res, GamePacketType.getRoomListResponse);
};

export default getRoomListHandler;
