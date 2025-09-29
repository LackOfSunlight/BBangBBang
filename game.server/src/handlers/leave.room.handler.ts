import { GamePacket } from '../generated/gamePacket';
import { GamePacketType, gamePackTypeSelect } from '../Enums/gamePacketType';
import { leaveRoomUseCase } from '../UseCase/Leave.room/leave.room.usecase';
import { sendData } from '../Sockets/send.data';
import { getGamePacketType } from '../Converter/type.form';
import { GameSocket } from '../Type/game.socket';

const leaveRoomHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.leaveRoomRequest);
	if (!payload) return;

	const req = payload.leaveRoomRequest;

	const res = await leaveRoomUseCase(socket, req);

	sendData(socket, res, GamePacketType.leaveRoomResponse);
};

export default leaveRoomHandler;
