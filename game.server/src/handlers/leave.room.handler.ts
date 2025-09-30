import { GamePacket } from '../generated/gamePacket';
import { GamePacketType, gamePackTypeSelect } from '../enums/gamePacketType';
import { leaveRoomUseCase } from '../useCase/leave.room/leave.room.usecase';
import { sendData } from '../sockets/send.data';
import { getGamePacketType } from '../converter/type.form';
import { GameSocket } from '../type/game.socket';

const leaveRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.leaveRoomRequest);
	if (!payload) return;

	const req = payload.leaveRoomRequest;

	const res = await leaveRoomUseCase(socket, req);

	sendData(socket, res, GamePacketType.leaveRoomResponse);
};

export default leaveRoomHandler;
