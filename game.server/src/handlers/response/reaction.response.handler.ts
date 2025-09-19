// import { GameSocket } from '../../type/game.socket.js';
// import { S2CReactionResponse } from '../../generated/packet/game_actions.js';
// import { GamePacket } from '../../generated/gamePacket.js';
// import { getGamePacketType } from '../../utils/type.converter.js';
// import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
// import { sendData } from '../../utils/send.data.js';
// import { RepeatType } from '@protobuf-ts/runtime';
// import { getRoom } from '../../utils/redis.util.js';

// const reactionResponseHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
// 	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.reactionResponse);

// 	if (!payload || !socket.userId || !socket.roomId) return;

// 	sendData(socket, gamePacket, GamePacketType.reactionResponse);
// };

// export default reactionResponseHandler;
