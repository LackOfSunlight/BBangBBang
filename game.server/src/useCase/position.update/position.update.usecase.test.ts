import positionUpdateUseCase from './position.update.usecase';
import { C2SPositionUpdateRequest } from '../../Generated/packet/game_actions';
import { GameSocket } from '../../Type/game.socket';
import { CharacterPositionData } from '../../Generated/common/types';
import { notificationCharacterPosition } from '../../Managers/game.manager';

jest.mock('../../managers/game.manager', () => ({
	notificationCharacterPosition: new Map(),
}));

const mockNotificationCharacterPosition = notificationCharacterPosition as unknown as jest.Mocked<
	Map<string, Map<string, CharacterPositionData>>
>;

beforeAll(() => {
	jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
	jest.restoreAllMocks();
});

describe('positionUpdateUseCase', () => {
	const roomId = '1';
	const userId = 'user1';
	const validX = 100.5;
	const validY = 200.3;

	beforeEach(() => {
		mockNotificationCharacterPosition.clear();
		const roomMap = new Map<string, CharacterPositionData>();
		mockNotificationCharacterPosition.set(roomId, roomMap);
	});

	describe('유효성 검증', () => {
		it('소켓에 userId가 없으면 함수가 실패한다', async () => {
			// @ts-expect-error: 테스트를 위한 모킹
			const mockSocket = {
				userId: undefined,
				roomId: roomId,
			} as GameSocket;

			const mockRequest: C2SPositionUpdateRequest = {
				x: validX,
				y: validY,
			};

			const result = await positionUpdateUseCase(mockSocket, mockRequest);

			expect(result).toBe(false);
		});

		it('소켓에 roomId가 없으면 함수가 실패한다', async () => {
			// ts-expect-error: 테스트를 위한 모킹
			const mockSocket = {
				userId: userId,
				roomId: undefined,
			} as GameSocket;

			const mockRequest: C2SPositionUpdateRequest = {
				x: validX,
				y: validY,
			};

			const result = await positionUpdateUseCase(mockSocket, mockRequest);

			expect(result).toBe(false);
		});

		it('X 좌표가 숫자가 아니면 함수가 실패한다', async () => {
			// @ts-expect-error: 테스트를 위한 모킹
			const mockSocket = {
				userId: userId,
				roomId: roomId,
			} as GameSocket;

			// @ts-expect-error: 테스트를 위한 모킹
			const mockRequest = {
				x: 'invalid',
				y: validY,
			} as C2SPositionUpdateRequest;

			const result = await positionUpdateUseCase(mockSocket, mockRequest);

			expect(result).toBe(false);
		});

		it('Y 좌표가 숫자가 아니면 함수가 실패한다', async () => {
			// @ts-expect-error: 테스트를 위한 모킹
			const mockSocket = {
				userId: userId,
				roomId: roomId,
			} as GameSocket;

			// @ts-expect-error: 테스트를 위한 모킹
			const mockRequest = {
				x: validX,
				y: null,
			} as C2SPositionUpdateRequest;

			const result = await positionUpdateUseCase(mockSocket, mockRequest);

			expect(result).toBe(false);
		});

		it('X와 Y 좌표 모두 유효하지 않으면 함수가 실패한다', async () => {
			// @ts-expect-error: 테스트를 위한 모킹
			const mockSocket = {
				userId: userId,
				roomId: roomId,
			} as GameSocket;

			// @ts-expect-error: 테스트를 위한 모킹
			const mockRequest = {
				x: undefined,
				y: 'invalid',
			} as C2SPositionUpdateRequest;

			const result = await positionUpdateUseCase(mockSocket, mockRequest);

			expect(result).toBe(false);
		});
	});

	describe('위치 업데이트 로직', () => {
		it('유효한 좌표로 위치가 업데이트된다', async () => {
			// @ts-expect-error: 테스트를 위한 모킹
			const mockSocket = {
				userId: userId,
				roomId: roomId,
			} as GameSocket;

			const mockRequest: C2SPositionUpdateRequest = {
				x: validX,
				y: validY,
			};

			const result = await positionUpdateUseCase(mockSocket, mockRequest);

			expect(result).toBe(true);

			const roomMap = mockNotificationCharacterPosition.get(roomId);
			expect(roomMap).toBeDefined();

			const positionData = roomMap!.get(userId);
			expect(positionData).toBeDefined();
			expect(positionData).toEqual({
				id: userId,
				x: validX,
				y: validY,
			});
		});

		it('정수 좌표로도 위치가 업데이트된다', async () => {
			// @ts-expect-error: 테스트를 위한 모킹
			const mockSocket = {
				userId: userId,
				roomId: roomId,
			} as GameSocket;

			const mockRequest: C2SPositionUpdateRequest = {
				x: 50,
				y: 75,
			};

			const result = await positionUpdateUseCase(mockSocket, mockRequest);

			expect(result).toBe(true);

			const roomMap = mockNotificationCharacterPosition.get(roomId);
			const positionData = roomMap!.get(userId);
			expect(positionData).toEqual({
				id: userId,
				x: 50,
				y: 75,
			});
		});

		it('음수 좌표로도 위치가 업데이트된다', async () => {
			// @ts-expect-error: 테스트를 위한 모킹
			const mockSocket = {
				userId: userId,
				roomId: roomId,
			} as GameSocket;

			const mockRequest: C2SPositionUpdateRequest = {
				x: -100.5,
				y: -200.3,
			};

			const result = await positionUpdateUseCase(mockSocket, mockRequest);

			expect(result).toBe(true);

			const roomMap = mockNotificationCharacterPosition.get(roomId);
			const positionData = roomMap!.get(userId);
			expect(positionData).toEqual({
				id: userId,
				x: -100.5,
				y: -200.3,
			});
		});

		it('0 좌표로도 위치가 업데이트된다', async () => {
			// @ts-expect-error: 테스트를 위한 모킹
			const mockSocket = {
				userId: userId,
				roomId: roomId,
			} as GameSocket;

			const mockRequest: C2SPositionUpdateRequest = {
				x: 0,
				y: 0,
			};

			const result = await positionUpdateUseCase(mockSocket, mockRequest);

			expect(result).toBe(true);

			const roomMap = mockNotificationCharacterPosition.get(roomId);
			const positionData = roomMap!.get(userId);
			expect(positionData).toEqual({
				id: userId,
				x: 0,
				y: 0,
			});
		});

		it('기존 위치를 새로운 위치로 덮어쓸 수 있다', async () => {
			// @ts-expect-error: 테스트를 위한 모킹
			const mockSocket = {
				userId: userId,
				roomId: roomId,
			} as GameSocket;

			const firstRequest: C2SPositionUpdateRequest = {
				x: 100,
				y: 200,
			};

			const firstResult = await positionUpdateUseCase(mockSocket, firstRequest);

			expect(firstResult).toBe(true);

			let roomMap = mockNotificationCharacterPosition.get(roomId);
			let positionData = roomMap!.get(userId);
			expect(positionData).toEqual({
				id: userId,
				x: 100,
				y: 200,
			});

			const secondRequest: C2SPositionUpdateRequest = {
				x: 300,
				y: 400,
			};

			const secondResult = await positionUpdateUseCase(mockSocket, secondRequest);

			expect(secondResult).toBe(true);

			roomMap = mockNotificationCharacterPosition.get(roomId);
			positionData = roomMap!.get(userId);
			expect(positionData).toEqual({
				id: userId,
				x: 300,
				y: 400,
			});
		});

		it('같은 방의 여러 사용자 위치를 독립적으로 관리할 수 있다', async () => {
			// @ts-expect-error: 테스트를 위한 모킹
			const user1Socket = {
				userId: 'user1',
				roomId: roomId,
			} as GameSocket;

			// @ts-expect-error: 테스트를 위한 모킹
			const user2Socket = {
				userId: 'user2',
				roomId: roomId,
			} as GameSocket;

			const user1Request: C2SPositionUpdateRequest = {
				x: 100,
				y: 200,
			};

			const user2Request: C2SPositionUpdateRequest = {
				x: 300,
				y: 400,
			};

			const user1Result = await positionUpdateUseCase(user1Socket, user1Request);
			const user2Result = await positionUpdateUseCase(user2Socket, user2Request);

			expect(user1Result).toBe(true);
			expect(user2Result).toBe(true);

			const roomMap = mockNotificationCharacterPosition.get(roomId);

			const user1Position = roomMap!.get('user1');
			expect(user1Position).toEqual({
				id: 'user1',
				x: 100,
				y: 200,
			});

			const user2Position = roomMap!.get('user2');
			expect(user2Position).toEqual({
				id: 'user2',
				x: 300,
				y: 400,
			});
		});
	});

	describe('에러 처리', () => {
		it('방 맵이 존재하지 않으면 에러가 발생한다', async () => {
			// @ts-expect-error: 테스트를 위한 모킹
			const mockSocket = {
				userId: userId,
				roomId: 'nonexistent-room',
			} as GameSocket;

			const mockRequest: C2SPositionUpdateRequest = {
				x: validX,
				y: validY,
			};

			await expect(positionUpdateUseCase(mockSocket, mockRequest)).rejects.toThrow();
		});

		it('매우 큰 좌표값도 처리할 수 있다', async () => {
			// @ts-expect-error: 테스트를 위한 모킹
			const mockSocket = {
				userId: userId,
				roomId: roomId,
			} as GameSocket;

			const mockRequest: C2SPositionUpdateRequest = {
				x: Number.MAX_SAFE_INTEGER,
				y: Number.MIN_SAFE_INTEGER,
			};

			const result = await positionUpdateUseCase(mockSocket, mockRequest);

			expect(result).toBe(true);

			const roomMap = mockNotificationCharacterPosition.get(roomId);
			const positionData = roomMap!.get(userId);
			expect(positionData).toEqual({
				id: userId,
				x: Number.MAX_SAFE_INTEGER,
				y: Number.MIN_SAFE_INTEGER,
			});
		});

		it('소수점이 많은 좌표값도 처리할 수 있다', async () => {
			// @ts-expect-error: 테스트를 위한 모킹
			const mockSocket = {
				userId: userId,
				roomId: roomId,
			} as GameSocket;

			const mockRequest: C2SPositionUpdateRequest = {
				x: 123.4567890123456789,
				y: 987.6543210987654321,
			};

			const result = await positionUpdateUseCase(mockSocket, mockRequest);

			expect(result).toBe(true);

			const roomMap = mockNotificationCharacterPosition.get(roomId);
			const positionData = roomMap!.get(userId);
			expect(positionData).toEqual({
				id: userId,
				x: 123.4567890123456789,
				y: 987.6543210987654321,
			});
		});
	});
});
