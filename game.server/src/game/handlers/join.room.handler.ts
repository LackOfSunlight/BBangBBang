import { GameSocket } from '@common/types/game.socket';
import { GamePacket } from '@core/generated/gamePacket';
import { getGamePacketType } from '@common/converters/type.form';
import { GamePacketType, gamePackTypeSelect } from '@game/enums/gamePacketType';
import joinRoomUseCase from '@game/usecases/join.room/join.room.usecase';
import { sendData } from '@core/network/sockets/send.data';

const joinRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.joinRoomRequest);

	if (!payload || !socket.userId) return;

	const req = payload.joinRoomRequest;

	const res = await joinRoomUseCase(socket, req);

	sendData(socket, res, GamePacketType.joinRoomResponse);
};

export default joinRoomHandler;
