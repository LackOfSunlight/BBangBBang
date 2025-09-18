// import { GameSocket } from '../../type/game.socket.js';
// import { GamePacket } from '../../generated/gamePacket.js';
// import { getGamePacketType } from '../../utils/type.converter.js';
// import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
// import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/redis.util.js';
// import { CardData } from '../../generated/common/types.js';
// import destroyCardResponseHandler from '../response/destroy.card.response.handler.js';

// const destroyCardRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
// 	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.destroyCardRequest);

// 	if (!payload || !socket.userId || !socket.roomId) {
// 		console.log('소켓과 패킷이 전달되지 않았습니다.');
// 		return;
// 	}

// 	const user = await getUserFromRoom(socket.roomId, socket.userId);

// 	if (!user || !user.character) {
// 		console.log('해당 유저가 존재하지 않습니다.');
// 		return;
// 	}

// 	const req = payload.destroyCardRequest;

// 	for (const destroyCard of req.destroyCards) {
// 		const idx = user.character.handCards.findIndex((c) => c.type === destroyCard.type);

// 		if (idx !== -1) {
// 			const card = user.character.handCards[idx];

// 			card.count -= destroyCard.count;

// 			if (card.count <= 0) {
// 				user.character.handCards.splice(idx, 1);
// 			}
// 		}
// 	}

// 	user.character.handCardsCount = user.character.handCards.reduce(
// 		(sum, card) => sum + card.count,
// 		0,
// 	);

// 	await updateCharacterFromRoom(socket.roomId, user.id, user.character);

// 	destroyCardResponseHandler(socket, setDestroyResponse(user.character.handCards));
// };

// const setDestroyResponse = (handCards: CardData[]): GamePacket => {
// 	const newGamePacket: GamePacket = {
// 		payload: {
// 			oneofKind: GamePacketType.destroyCardResponse,
// 			destroyCardResponse: {
// 				handCards,
// 			},
// 		},
// 	};

// 	return newGamePacket;
// };

// export default destroyCardRequestHandler;
