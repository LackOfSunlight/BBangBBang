import { GamePacket } from '@core/generated/gamePacket';
import { GamePacketType, gamePackTypeSelect } from '@game/enums/gamePacketType';
import { leaveRoomUseCase } from '@game/usecases/leave.room/leave.room.usecase';
import { sendData } from '@core/network/sockets/send.data';
import { getGamePacketType } from '@common/converters/type.form';
import { GameSocket } from '@common/types/game.socket';

const leaveRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.leaveRoomRequest);
	if (!payload) return;

	const req = payload.leaveRoomRequest;

	const res = await leaveRoomUseCase(socket, req);

	sendData(socket, res, GamePacketType.leaveRoomResponse);
};

export default leaveRoomHandler;
