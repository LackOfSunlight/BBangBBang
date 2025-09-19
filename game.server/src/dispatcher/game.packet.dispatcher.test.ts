import { Socket } from 'net';
import { gamePacketDispatcher } from './game.packet.dispatcher.js';
import { GamePacket } from '../generated/gamePacket.js';

// Mock all handlers
import registerHandler from '../handlers/register.handler.js';
import loginHandler from '../handlers/login.handler.js';
import createRoomHandler from '../handlers/create.room.handler.js';
import getRoomListHandler from '../handlers/get.room.list.handler.js';
import joinRoomHandler from '../handlers/join.room.handler.js';
import leaveRoomHandler from '../handlers/leave.room.handler.js';
import gamePrepareHandler from '../handlers/game.prepare.handler.js';
import positionUpdateHandler from '../handlers/position.update.handler.js';
import useCardHandler from '../handlers/use.card.handler.js';
import reactionRequestHandler from '../handlers/request/reaction.request.handler.js';
import passDebuffHandler from '../handlers/pass.debuff.handler.js';
import { GameStateData } from '../generated/common/types.js';
import gameStartHandler from '../handlers/game.start.handler.js';
import fleaMarketPickHandler from '../handlers/fleamarket.pick.handler.js';
import destroyCardHandler from '../handlers/destroy.card.handler.js';
import cardSelectHandler from '../handlers/card.select.handler.js';

jest.mock('../handlers/register.handler.js');
jest.mock('../handlers/login.handler.js');
jest.mock('../handlers/create.room.handler.js');
jest.mock('../handlers/get.room.list.handler.js');
jest.mock('../handlers/join.room.handler.js');
jest.mock('../handlers/leave.room.handler.js');
jest.mock('../handlers/game.prepare.handler.js');
jest.mock('../handlers/request/game.start.request.handler.js');
jest.mock('../handlers/position.update.handler.js');
jest.mock('../handlers/use.card.handler.js');
jest.mock('../handlers/request/flea.market.pick.request.handler.js');
jest.mock('../handlers/request/reaction.request.handler.js');
jest.mock('../handlers/request/destroy.card.request.handler.js');
jest.mock('../handlers/request/card.select.request.handler.js');
jest.mock('../handlers/pass.debuff.handler.js');

const allHandlers = [
	registerHandler,
	loginHandler,
	createRoomHandler,
	getRoomListHandler,
	joinRoomHandler,
	leaveRoomHandler,
	gamePrepareHandler,
	gameStartHandler,
	positionUpdateHandler,
	useCardHandler,
	fleaMarketPickHandler,
	reactionRequestHandler,
	destroyCardHandler,
	cardSelectHandler,
	passDebuffHandler,
];

describe('gamePacketDispatcher', () => {
	let mockSocket: Socket;
	let consoleWarnSpy: jest.SpyInstance;
	let consoleLogSpy: jest.SpyInstance;

	beforeEach(() => {
		mockSocket = new Socket();
		consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

		// Clear all mocks before each test
		allHandlers.forEach((handler) => (handler as jest.Mock).mockClear());
	});

	afterEach(() => {
		consoleWarnSpy.mockRestore();
		consoleLogSpy.mockRestore();
	});

	it('registerRequest 패킷에 대해 올바른 핸들러를 호출해야 한다', () => {
		const gamePacket: GamePacket = {
			payload: {
				oneofKind: 'registerRequest',
				registerRequest: { email: 'test@naver.com', nickname: 'testUser', password: 'qwer1234!!' },
			},
		};

		gamePacketDispatcher(mockSocket, gamePacket);

		expect(registerHandler).toHaveBeenCalledTimes(1);
		expect(registerHandler).toHaveBeenCalledWith(mockSocket, gamePacket);
		expect(loginHandler).not.toHaveBeenCalled();
		expect(consoleLogSpy).not.toHaveBeenCalled();
	});

	it('joinRandomRoomRequest 패킷에 대해 올바른 핸들러를 호출해야 한다', () => {
		const gamePacket: GamePacket = {
			payload: {
				oneofKind: 'joinRandomRoomRequest',
				joinRandomRoomRequest: { userId: '1' },
			},
		};

		gamePacketDispatcher(mockSocket, gamePacket);

		// joinRoomHandler handles both joinRoomRequest and joinRandomRoomRequest
		expect(joinRoomHandler).toHaveBeenCalledTimes(1);
		expect(joinRoomHandler).toHaveBeenCalledWith(mockSocket, gamePacket);
		expect(consoleLogSpy).not.toHaveBeenCalled();
	});

	it('핸들러가 없는 패킷 타입(예: notification)에 대해 메시지를 로그해야 한다', () => {
		const gamePacket: GamePacket = {
			payload: {
				oneofKind: 'gameStartNotification', // This type does not have a handler in the dispatcher
				gameStartNotification: { users: [], characterPositions: [{ id: '1', x: 0, y: 0 }] },
			},
		};

		gamePacketDispatcher(mockSocket, gamePacket);

		expect(consoleLogSpy).toHaveBeenCalledWith(
			'Ignoring packet with no handler: gameStartNotification',
		);

		// Ensure no request handlers were called
		allHandlers.forEach((handler) => expect(handler).not.toHaveBeenCalled());
	});

	it('payload.oneofKind가 정의되지 않은 경우 경고를 로그해야 한다', () => {
		const gamePacket: GamePacket = {
			payload: {
				oneofKind: undefined,
			},
		};

		gamePacketDispatcher(mockSocket, gamePacket);

		expect(consoleWarnSpy).toHaveBeenCalledWith('Received packet with no oneofKind payload.');
		expect(consoleLogSpy).not.toHaveBeenCalled();
		allHandlers.forEach((handler) => expect(handler).not.toHaveBeenCalled());
	});
});
