import { GameSocket } from '../../type/game.socket';
import { C2SGameStartRequest } from '../../generated/packet/game_actions';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { GlobalFailCode, RoomStateType, PhaseType, CardType } from '../../generated/common/enums';
import { GamePacketType } from '../../enums/gamePacketType';
import { CharacterPositionData, GameStateData } from '../../generated/common/types';

// Mocking dependencies
jest.mock('../../utils/room.utils', () => ({
	getRoom: jest.fn(),
	saveRoom: jest.fn(),
}));
jest.mock('../../utils/notification.util', () => ({
	broadcastDataToRoom: jest.fn(),
}));
jest.mock('../../utils/shuffle.util', () => ({
	shuffle: jest.fn(),
}));
jest.mock('../../managers/card.manager', () => ({
	drawDeck: jest.fn(),
	initializeDeck: jest.fn(),
}));
jest.mock('../../managers/game.manager', () => ({
	__esModule: true,
	default: {
		startGame: jest.fn(),
	},
	notificationCharacterPosition: {
		has: jest.fn(),
		set: jest.fn(),
		get: jest.fn(),
	},
}));

// Imports for the use case and mocks
import { getRoom, saveRoom } from '../../utils/room.utils';
import { broadcastDataToRoom } from '../../utils/notification.util';
import { shuffle } from '../../utils/shuffle.util';
import { drawDeck, initializeDeck } from '../../managers/card.manager';
import gameManager, { notificationCharacterPosition } from '../../managers/game.manager';
import { gameStartUseCase } from './game.start.usecase';
import characterSpawnPosition from '../../data/character.spawn.position.json';

// Mock 함수 캐스팅
const mockGetRoom = getRoom as jest.Mock;
const mockSaveRoom = saveRoom as jest.Mock;
const mockBroadcastDataToRoom = broadcastDataToRoom as jest.Mock;
const mockShuffle = shuffle as jest.Mock;
const mockDrawDeck = drawDeck as jest.Mock;
const mockInitializeDeck = initializeDeck as jest.Mock;
const mockGameManagerStartGame = gameManager.startGame as jest.Mock;

// notificationCharacterPosition은 전역 Map이므로, Mocking된 모듈에서 가져와야 함
const mockNotificationCharacterPosition = notificationCharacterPosition as jest.Mocked<
	typeof notificationCharacterPosition
>;

describe('gameStartUseCase', () => {
	let mockSocket: GameSocket;
	const mockReq: C2SGameStartRequest = {};

	const user1 = new User('user-1', 'User1');
	const user2 = new User('user-2', 'User2');
	const user3 = new User('user-3', 'User3');

	let testPosMap: Map<string, CharacterPositionData>;

	beforeEach(() => {
		jest.clearAllMocks();
		mockSocket = { userId: 'user-1', roomId: 1 } as GameSocket;
		testPosMap = new Map<string, CharacterPositionData>();

		// jest.mock factory에서 생성된 모의 함수의 동작을 설정합니다.
		mockNotificationCharacterPosition.has.mockReturnValue(false);
		mockNotificationCharacterPosition.get.mockReturnValue(testPosMap);
	});

	// --- 유효성 검사 테스트 --- //

	it('소켓에 roomId가 없으면 INVALID_REQUEST를 반환해야 한다', async () => {
		mockSocket.roomId = undefined;
		const result = await gameStartUseCase(mockSocket, mockReq);

		expect(result.payload.oneofKind).toBe('gameStartResponse');
		if (result.payload.oneofKind === 'gameStartResponse') {
			expect(result.payload.gameStartResponse.failCode).toBe(GlobalFailCode.INVALID_REQUEST);
		}
	});

	it('방을 찾을 수 없으면 ROOM_NOT_FOUND를 반환해야 한다', async () => {
		mockGetRoom.mockReturnValue(null);
		const result = await gameStartUseCase(mockSocket, mockReq);

		expect(result.payload.oneofKind).toBe('gameStartResponse');
		if (result.payload.oneofKind === 'gameStartResponse') {
			expect(result.payload.gameStartResponse.failCode).toBe(GlobalFailCode.ROOM_NOT_FOUND);
		}
	});

	// --- 핵심 로직 테스트 --- //

	it('성공적으로 게임을 시작하고, 위치 할당, 카드 분배, 유저 알림을 처리해야 한다', async () => {
		// Arrange
		const users = [user1, user2, user3];
		const mockRoom = new Room(1, user1.id, 'Test Room', 8, RoomStateType.WAIT, users);
		// 카드 분배를 위해 캐릭터 데이터 할당
		users.forEach((u) => (u.character = { hp: 4, handCards: [], handCardsCount: 0 } as any));

		mockGetRoom.mockReturnValue(mockRoom);

		// 스폰 위치 Mocking
		const mockSpawnPositions: CharacterPositionData[] = [
			{ id: 'user-1', x: 1, y: 1 },
			{ id: 'user-2', x: 2, y: 2 },
			{ id: 'user-3', x: 3, y: 3 },
		];
		mockShuffle.mockReturnValue(mockSpawnPositions);

		// 카드 분배 Mocking
		mockDrawDeck.mockImplementation((roomId, hp) => {
			if (hp === 4) return [CardType.HAND_GUN, CardType.SHIELD];
			return [];
		});

		// Act
		const result = await gameStartUseCase(mockSocket, mockReq);

		// Assert
		// 1. 요청자에게 성공 응답을 반환했는지 확인
		expect(result.payload.oneofKind).toBe('gameStartResponse');
		if (
			result.payload.oneofKind !== 'gameStartResponse' ||
			!result.payload.gameStartResponse.success
		) {
			fail('Expected a successful gameStartResponse');
		}

		// 2. saveRoom 함수가 호출되었는지 확인
		expect(mockSaveRoom).toHaveBeenCalledTimes(1);
		const savedRoom = mockSaveRoom.mock.calls[0][0] as Room;

		// 3. 저장된 방의 상태가 INGAME으로 변경되었는지 확인
		expect(savedRoom.state).toBe(RoomStateType.INGAME);

		// 4. 카드 덱 초기화 함수 호출 확인
		expect(mockInitializeDeck).toHaveBeenCalledWith(mockRoom.id);

		// 5. notificationCharacterPosition Map 업데이트 확인
		expect(mockNotificationCharacterPosition.has).toHaveBeenCalledWith(mockRoom.id);
		expect(mockNotificationCharacterPosition.set).toHaveBeenCalledWith(
			mockRoom.id,
			expect.any(Map),
		);
		expect(testPosMap.get(user1.id)).toEqual(mockSpawnPositions[0]);
		expect(testPosMap.get(user2.id)).toEqual(mockSpawnPositions[1]);
		expect(testPosMap.get(user3.id)).toEqual(mockSpawnPositions[2]);

		// 6. 유저 캐릭터 데이터 (손패 카드) 업데이트 확인
		expect(savedRoom.users[0].character!.handCards).toEqual([
			{ type: CardType.HAND_GUN, count: 1 },
			{ type: CardType.SHIELD, count: 1 },
		]);
		expect(savedRoom.users[0].character!.handCardsCount).toBe(2);
		expect(savedRoom.users[1].character!.handCards).toEqual([
			{ type: CardType.HAND_GUN, count: 1 },
			{ type: CardType.SHIELD, count: 1 },
		]);
		expect(savedRoom.users[1].character!.handCardsCount).toBe(2);
		expect(savedRoom.users[2].character!.handCards).toEqual([
			{ type: CardType.HAND_GUN, count: 1 },
			{ type: CardType.SHIELD, count: 1 },
		]);
		expect(savedRoom.users[2].character!.handCardsCount).toBe(2);

		// 7. gameManager.startGame 호출 확인
		expect(mockGameManagerStartGame).toHaveBeenCalledWith(mockRoom);

		// 8. 모든 유저에게 알림이 전송되었는지 확인
		expect(mockBroadcastDataToRoom).toHaveBeenCalledTimes(1);
		const expectedGameState: GameStateData = {
			phaseType: PhaseType.DAY,
			nextPhaseAt: expect.any(String), // Date.now()는 예측 불가
		};
		expect(mockBroadcastDataToRoom).toHaveBeenCalledWith(
			mockRoom.users,
			expect.objectContaining({
				payload: {
					oneofKind: 'gameStartNotification',
					gameStartNotification: {
						gameState: expectedGameState,
						users: mockRoom.users,
						characterPositions: mockSpawnPositions,
					},
				},
			}),
			GamePacketType.gameStartNotification,
		);
	});

	// --- 에러 처리 테스트 --- //

	it('로직 수행 중 에러 발생 시 UNKNOWN_ERROR를 반환해야 한다', async () => {
		const error = new Error('DB Connection Failed');
		mockGetRoom.mockImplementation(() => {
			throw error;
		});

		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

		const result = await gameStartUseCase(mockSocket, mockReq);

		consoleErrorSpy.mockRestore();

		expect(result.payload.oneofKind).toBe('gameStartResponse');
		if (result.payload.oneofKind === 'gameStartResponse') {
			expect(result.payload.gameStartResponse.failCode).toBe(GlobalFailCode.UNKNOWN_ERROR);
		}
	});
});
