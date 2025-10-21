import { GameSocket } from '@common/types/game.socket';
import { GamePacket } from '@core/generated/gamePacket';
import { getGamePacketType } from '@common/converters/type.form';
import { GamePacketType, gamePackTypeSelect } from '@game/enums/gamePacketType';
import joinRandomRoomUseCase from '@game/usecases/join.random.room/join.random.room.usecase';
import { sendData } from '@core/network/sockets/send.data';

const joinRandomRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.joinRandomRoomRequest);

	if (!payload || !socket.userId) return;

	const req = payload.joinRandomRoomRequest;

	const res = await joinRandomRoomUseCase(socket, req);

	sendData(socket, res, GamePacketType.joinRandomRoomResponse);
};

export default joinRandomRoomHandler;
