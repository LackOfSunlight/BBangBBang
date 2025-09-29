import { GameSocket } from '../Type/game.socket';
import { GamePacket } from '../Generated/gamePacket';
import { getGamePacketType } from '../Converter/type.form';
import { GamePacketType, gamePackTypeSelect } from '../Enums/gamePacketType';
import { sendData } from '../Sockets/send.data';
import getRoomListUseCase from '../UseCase/Get.room.list/get.room.list.usecase';

const getRoomListHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.getRoomListRequest);

	if (!payload || !socket.userId) return;

	const req = payload.getRoomListRequest;

	const res = getRoomListUseCase(socket, req);

	sendData(socket, res, GamePacketType.getRoomListResponse);
};

export default getRoomListHandler;
