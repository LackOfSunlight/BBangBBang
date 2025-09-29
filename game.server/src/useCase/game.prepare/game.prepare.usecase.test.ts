import { GameSocket } from '../../Type/game.socket.js';
import { C2SGamePrepareRequest } from '../../Generated/packet/game_actions.js';
import { Room } from '../../Models/room.model.js';
import { User } from '../../Models/user.model.js';
import {
	GlobalFailCode,
	RoleType,
	RoomStateType,
	CharacterType,
} from '../../Generated/common/enums.js';
import { GamePacketType } from '../../Enums/gamePacketType.js';
import { broadcastDataToRoom } from '../../Sockets/notification.js';
import { gamePrepareUseCase } from './game.prepare.usecase.js';
import characterType from '../../data/characterType.json';
import { getRoom, saveRoom } from '../../Utils/room.utils.js';

// 의존성 Mock 처리
jest.mock('../../utils/room.utils.js');
jest.mock('../../utils/notification.util.js');

// Mock 함수 캐스팅
const mockGetRoom = getRoom as jest.Mock;
const mockSaveRoom = saveRoom as jest.Mock;
const mockBroadcastDataToRoom = broadcastDataToRoom as jest.Mock;

describe('gamePrepareUseCase', () => {
	let mockSocket: GameSocket;
	const mockReq: C2SGamePrepareRequest = {};
	let randomMock: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		mockSocket = { userId: 'user-1', roomId: 1 } as GameSocket;
	});

	afterEach(() => {
		// 테스트 후 Math.random Mock을 복원
		if (randomMock) {
			randomMock.mockRestore();
		}
	});

	// --- 유효성 검사 테스트 --- //

	it('소켓에 roomId가 없으면 INVALID_REQUEST를 반환해야 한다', async () => {
		mockSocket.roomId = undefined;
		const result = await gamePrepareUseCase(mockSocket, mockReq);

		expect(result.payload.oneofKind).toBe('gamePrepareResponse');
		if (result.payload.oneofKind === 'gamePrepareResponse') {
			expect(result.payload.gamePrepareResponse.failCode).toBe(GlobalFailCode.INVALID_REQUEST);
		}
	});

	it('방을 찾을 수 없으면 ROOM_NOT_FOUND를 반환해야 한다', async () => {
		mockGetRoom.mockReturnValue(null);
		const result = await gamePrepareUseCase(mockSocket, mockReq);

		expect(result.payload.oneofKind).toBe('gamePrepareResponse');
		if (result.payload.oneofKind === 'gamePrepareResponse') {
			expect(result.payload.gamePrepareResponse.failCode).toBe(GlobalFailCode.ROOM_NOT_FOUND);
		}
	});

	it('지원되지 않는 인원 수일 경우 INVALID_REQUEST를 반환해야 한다', async () => {
		const user1 = new User('user-1', 'User1');
		const mockRoom = new Room(1, user1.id, 'Test Room', 8, RoomStateType.WAIT, [user1]); // 1명
		mockGetRoom.mockReturnValue(mockRoom);

		const result = await gamePrepareUseCase(mockSocket, mockReq);

		expect(result.payload.oneofKind).toBe('gamePrepareResponse');
		if (result.payload.oneofKind === 'gamePrepareResponse') {
			expect(result.payload.gamePrepareResponse.failCode).toBe(GlobalFailCode.INVALID_REQUEST);
		}
	});

	// --- 핵심 로직 테스트 --- //

	it('성공적으로 게임을 준비하고, 역할을 할당하고, 유저들에게 알려야 한다', async () => {
		// Arrange
		const user1 = new User('user-1', 'User1');
		const user2 = new User('user-2', 'User2');
		const users = [user1, user2];
		const mockRoom = new Room(1, user1.id, 'Test Room', 8, RoomStateType.WAIT, users);
		mockGetRoom.mockReturnValue(mockRoom);

		// Math.random()이 항상 0을 반환하도록 하여 첫 번째 요소만 선택하게 만듦
		randomMock = jest.spyOn(Math, 'random').mockReturnValue(0);

		// Act
		const result = await gamePrepareUseCase(mockSocket, mockReq);

		// Assert
		// 1. 요청자에게 성공 응답을 반환했는지 확인
		expect(result.payload.oneofKind).toBe('gamePrepareResponse');
		if (
			result.payload.oneofKind !== 'gamePrepareResponse' ||
			!result.payload.gamePrepareResponse.success
		) {
			fail('Expected a successful gamePrepareResponse');
		}

		// 2. saveRoom 함수가 호출되었는지 확인
		expect(mockSaveRoom).toHaveBeenCalledTimes(1);
		const savedRoom = mockSaveRoom.mock.calls[0][0] as Room;

		// 3. 저장된 방의 상태가 INGAME으로 변경되었는지 확인
		expect(savedRoom.state).toBe(RoomStateType.INGAME);

		// 4. 역할/캐릭터 할당이 예측대로 되었는지 확인 (2인 기준: TARGET, HITMAN)
		expect(savedRoom.users.length).toBe(2);
		expect(savedRoom.users[0].character!.roleType).toBe(RoleType.TARGET);
		expect(savedRoom.users[1].character!.roleType).toBe(RoleType.HITMAN);

		// 첫 번째 캐릭터가 할당되었는지 확인 (characterType.json의 첫 번째 캐릭터)
		const firstCharacterType =
			CharacterType[characterType[0].characterType as keyof typeof CharacterType];
		expect(savedRoom.users[0].character!.characterType).toBe(firstCharacterType);

		// 5. 모든 유저에게 알림이 전송되었는지 확인
		expect(mockBroadcastDataToRoom).toHaveBeenCalledTimes(1);
		expect(mockBroadcastDataToRoom).toHaveBeenCalledWith(
			savedRoom.users,
			expect.objectContaining({
				payload: {
					oneofKind: 'gamePrepareNotification',
					gamePrepareNotification: { room: savedRoom },
				},
			}),
			GamePacketType.gamePrepareNotification,
		);
	});

	// --- 에러 처리 테스트 --- //

	it('로직 수행 중 에러 발생 시 UNKNOWN_ERROR를 반환해야 한다', async () => {
		const error = new Error('Redis connection failed');
		mockGetRoom.mockImplementation(() => {
			throw error;
		});

		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

		const result = await gamePrepareUseCase(mockSocket, mockReq);

		consoleErrorSpy.mockRestore();

		expect(result.payload.oneofKind).toBe('gamePrepareResponse');
		if (result.payload.oneofKind === 'gamePrepareResponse') {
			expect(result.payload.gamePrepareResponse.failCode).toBe(GlobalFailCode.UNKNOWN_ERROR);
		}
	});
});
