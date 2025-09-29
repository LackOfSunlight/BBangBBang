// game.server/src/handlers/gamePacketHandler.ts
import { Socket } from 'net';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType, RequestPacketType } from '../Enums/gamePacketType';
import registerHandler from '../Handlers/register.handler';
import loginHandler from '../Handlers/login.handler';
import createRoomHandler from '../Handlers/create.room.handler';
import getRoomListHandler from '../Handlers/get.room.list.handler';
import joinRoomHandler from '../Handlers/join.room.handler';
import leaveRoomHandler from '../Handlers/leave.room.handler';
import gamePrepareHandler from '../Handlers/game.prepare.handler';
import positionUpdateHandler from '../Handlers/position.update.handler';
import useCardHandler from '../Handlers/use.card.handler';
import passDebuffHandler from '../Handlers/pass.debuff.handler';
import gameStartHandler from '../Handlers/game.start.handler';
import fleaMarketPickHandler from '../Handlers/fleamarket.pick.handler';
import destroyCardHandler from '../Handlers/destroy.card.handler';
import cardSelectHandler from '../Handlers/card.select.handler';
import reactionUpdateHandler from '../Handlers/reaction.update.handler';
import joinRandomRoomHandler from '../Handlers/join.random.room.handler';

// Request Handlers

const handlers: Record<RequestPacketType, (socket: Socket, gamePacket: GamePacket) => void> = {
	// Requests
	[GamePacketType.registerRequest]: registerHandler,
	[GamePacketType.loginRequest]: loginHandler,
	[GamePacketType.createRoomRequest]: createRoomHandler,
	[GamePacketType.getRoomListRequest]: getRoomListHandler,
	[GamePacketType.joinRoomRequest]: joinRoomHandler,
	[GamePacketType.joinRandomRoomRequest]: joinRandomRoomHandler,
	[GamePacketType.leaveRoomRequest]: leaveRoomHandler,
	[GamePacketType.gamePrepareRequest]: gamePrepareHandler,
	[GamePacketType.gameStartRequest]: gameStartHandler,
	[GamePacketType.positionUpdateRequest]: positionUpdateHandler,
	[GamePacketType.useCardRequest]: useCardHandler,
	[GamePacketType.fleaMarketPickRequest]: fleaMarketPickHandler,
	[GamePacketType.reactionRequest]: reactionUpdateHandler,
	[GamePacketType.destroyCardRequest]: destroyCardHandler,
	[GamePacketType.cardSelectRequest]: cardSelectHandler,
	[GamePacketType.passDebuffRequest]: passDebuffHandler,
};

export function gamePacketDispatcher(socket: Socket, gamePacket: GamePacket) {
	const { payload } = gamePacket;

	if (!payload.oneofKind) {
		console.warn('Received packet with no oneofKind payload.');
		return;
	}

	const packetType = payload.oneofKind;
	const handler = handlers[packetType as RequestPacketType];

	if (handler) {
		// The handler function is called with the socket and the specific payload
		handler(socket, gamePacket);
	} else {
		console.log(`Ignoring packet with no handler: ${packetType}`);
	}
}
