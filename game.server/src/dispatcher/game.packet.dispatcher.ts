// game.server/src/handlers/gamePacketHandler.ts
import { Socket } from 'net';
import { GamePacket } from '../generated/gamePacket.js';
import { GamePacketType, RequestPacketType } from '../enums/gamePacketType.js';
import registerHandler from '../handlers/register.handler.js';
import loginHandler from '../handlers/login.handler.js';
import createRoomHandler from '../handlers/create.room.handler.js';
import getRoomListHandler from '../handlers/get.room.list.handler.js';
import joinRoomHandler from '../handlers/join.room.handler.js';
import leaveRoomHandler from '../handlers/leave.room.handler.js';
import gamePrepareHandler from '../handlers/game.prepare.handler.js';
import positionUpdateHandler from '../handlers/position.update.handler.js';
import useCardHandler from '../handlers/use.card.handler.js';
import passDebuffHandler from '../handlers/pass.debuff.handler.js';
import gameStartHandler from '../handlers/game.start.handler.js';
import fleaMarketPickHandler from '../handlers/fleamarket.pick.handler.js';
import destroyCardHandler from '../handlers/destroy.card.handler.js';
import cardSelectHandler from '../handlers/card.select.handler.js';
import reactionUpdateHandler from '../handlers/reaction.update.handler.js';

// Request Handlers

const handlers: Record<RequestPacketType, (socket: Socket, gamePacket: GamePacket) => void> = {
	// Requests
	[GamePacketType.registerRequest]: registerHandler,
	[GamePacketType.loginRequest]: loginHandler,
	[GamePacketType.createRoomRequest]: createRoomHandler,
	[GamePacketType.getRoomListRequest]: getRoomListHandler,
	[GamePacketType.joinRoomRequest]: joinRoomHandler,
	[GamePacketType.joinRandomRoomRequest]: joinRoomHandler,
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

	const packetType = payload.oneofKind as GamePacketType;
	const handler = handlers[packetType as RequestPacketType];

	if (handler) {
		// The handler function is called with the socket and the specific payload
		handler(socket, gamePacket);
	} else {
		console.log(`Ignoring packet with no handler: ${packetType}`);
	}
}
