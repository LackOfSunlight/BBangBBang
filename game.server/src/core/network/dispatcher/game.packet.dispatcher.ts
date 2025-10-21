import { Socket } from 'net';
import { GamePacketType, RequestPacketType } from '@game/enums/gamePacketType';
import { GamePacket } from '@core/generated/gamePacket';
import registerHandler from '@core/network/handlers/register.handler';
import loginHandler from '@core/network/handlers/login.handler';
import getRoomListHandler from '@game/handlers/get.room.list.handler';
import joinRoomHandler from '@game/handlers/join.room.handler';
import createRoomHandler from '@game/handlers/create.room.handler';
import joinRandomRoomHandler from '@game/handlers/join.random.room.handler';
import leaveRoomHandler from '@game/handlers/leave.room.handler';
import gamePrepareHandler from '@game/handlers/game.prepare.handler';
import gameStartHandler from '@game/handlers/game.start.handler';
import positionUpdateHandler from '@game/handlers/position.update.handler';
import useCardHandler from '@game/handlers/use.card.handler';
import fleaMarketPickHandler from '@game/handlers/fleamarket.pick.handler';
import reactionUpdateHandler from '@game/handlers/reaction.update.handler';
import destroyCardHandler from '@game/handlers/destroy.card.handler';
import cardSelectHandler from '@game/handlers/card.select.handler';
import passDebuffHandler from '@game/handlers/pass.debuff.handler';

// 새로운 Auth 도메인 핸들러들
import newRegisterHandler from '@auth/handlers/register.handler';
import newLoginHandler from '@auth/handlers/login.handler';

// Feature Flag: 새로운 Auth 핸들러 사용 여부
const USE_NEW_AUTH_HANDLERS = process.env.USE_NEW_AUTH === 'true';

const handlers: Record<RequestPacketType, (socket: Socket, gamePacket: GamePacket) => void> = {
	// Requests
	[GamePacketType.registerRequest]: USE_NEW_AUTH_HANDLERS ? newRegisterHandler : registerHandler,
	[GamePacketType.loginRequest]: USE_NEW_AUTH_HANDLERS ? newLoginHandler : loginHandler,
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

	// Feature Flag 상태 로깅
	if (packetType === 'registerRequest' || packetType === 'loginRequest') {
		console.log(`[PacketDispatcher] Auth handler mode: ${USE_NEW_AUTH_HANDLERS ? 'NEW' : 'LEGACY'}`);
	}

	if (handler) {
		// The handler function is called with the socket and the specific payload
		handler(socket, gamePacket);
	} else {
		console.log(`Ignoring packet with no handler: ${packetType}`);
	}
}
