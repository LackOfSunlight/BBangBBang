// import { GameSocket } from '../../type/game.socket.js';
// import { GamePacket } from '../../generated/gamePacket.js';
// import { saveRoom } from '../../utils/redis.util.js';
// import { getGamePacketType } from '../../utils/type.converter.js';
// import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
// import { sendData } from '../../utils/send.data.js';

// const createRoomResponseHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
// 	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.createRoomResponse);
// 	if (!payload || !socket.userId) return;
// 	const res = payload.createRoomResponse;

// 	if (!res.room) return;

// 	await saveRoom(res.room);

// 	sendData(socket, gamePacket, GamePacketType.createRoomResponse);
// };

// export default createRoomResponseHandler;
