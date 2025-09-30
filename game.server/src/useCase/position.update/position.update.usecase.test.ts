import positionUpdateUseCase from './position.update.usecase';
import { C2SPositionUpdateRequest } from '../../generated/packet/game_actions';
import { GameSocket } from '../../type/game.socket';
import { CharacterPositionData } from '../../generated/common/types';
import { notificationCharacterPosition, roomPositionChanged } from '../../managers/game.manager';

// Mock 설정
jest.mock('../../managers/game.manager', () => ({
	notificationCharacterPosition: new Map(),
	roomPositionChanged: new Map(),
}));

const mockNotificationCharacterPosition = notificationCharacterPosition as unknown as jest.Mocked<
	Map<string, Map<string, CharacterPositionData>>
>;
const mockRoomPositionChanged = roomPositionChanged as unknown as jest.Mocked<Map<string, boolean>>;

/**
 * 플레이어 위치 업데이트 기능 테스트
 */
describe('positionUpdateUseCase', () => {
	const roomId = '1';
	const userId = 'user1';

	beforeEach(() => {
		// Mock 초기화
		mockNotificationCharacterPosition.clear();
		mockRoomPositionChanged.clear();
		
		// 방 위치 맵 설정
		const roomMap = new Map<string, CharacterPositionData>();
		mockNotificationCharacterPosition.set(roomId, roomMap);
		mockRoomPositionChanged.set(roomId, false);
	});

	/**
	 * 시나리오 1: 플레이어 이동 (정상적인 위치 업데이트)
	 * - 플레이어가 게임에서 이동할 때 위치가 정상적으로 업데이트되는지 확인
	 * - 위치 변경 감지 및 브로드캐스트 플래그 설정 확인
	 */
	it('시나리오 1: 플레이어가 정상적으로 이동하면 위치가 업데이트되어야 함', async () => {
		// Given: 플레이어가 이동 요청
		const mockSocket = createMockSocket(userId, roomId);
		const mockRequest: C2SPositionUpdateRequest = {
			x: 100.5,
			y: 200.3,
		};

		// When: 위치 업데이트 실행
		const result = await positionUpdateUseCase(mockSocket, mockRequest);

		// Then: 성공 확인
		expect(result).toBe(true);

		// 위치 데이터 저장 확인
		const roomMap = mockNotificationCharacterPosition.get(roomId);
		const positionData = roomMap!.get(userId);
		expect(positionData).toEqual({
			id: userId,
			x: 100.5,
			y: 200.3,
		});

		// 브로드캐스트 플래그 설정 확인
		expect(mockRoomPositionChanged.get(roomId)).toBe(true);
	});

	/**
	 * 시나리오 2: 위치 변경 감지 (성능 최적화)
	 * - 같은 위치로 이동할 때는 Map에 저장하지 않음
	 * - 다른 위치로 이동할 때만 Map에 저장하고 플래그 설정
	 */
	it('시나리오 2: 같은 위치로 이동하면 Map에 저장되지 않아야 함', async () => {
		// Given: 플레이어가 이미 특정 위치에 있음
		const mockSocket = createMockSocket(userId, roomId);
		const initialRequest: C2SPositionUpdateRequest = {
			x: 100,
			y: 200,
		};

		// 첫 번째 이동
		await positionUpdateUseCase(mockSocket, initialRequest);
		expect(mockRoomPositionChanged.get(roomId)).toBe(true);

		// 플래그 리셋 (실제 게임에서는 broadcastPositionUpdates에서 리셋됨)
		mockRoomPositionChanged.set(roomId, false);

		// When: 같은 위치로 다시 이동
		const samePositionRequest: C2SPositionUpdateRequest = {
			x: 100,
			y: 200,
		};

		const result = await positionUpdateUseCase(mockSocket, samePositionRequest);

		// Then: 성공하지만 플래그는 변경되지 않음
		expect(result).toBe(true);
		expect(mockRoomPositionChanged.get(roomId)).toBe(false);
	});

	it('시나리오 3: 다른 위치로 이동하면 Map에 저장되어야 함', async () => {
		// Given: 플레이어가 이미 특정 위치에 있음
		const mockSocket = createMockSocket(userId, roomId);
		const initialRequest: C2SPositionUpdateRequest = {
			x: 100,
			y: 200,
		};

		await positionUpdateUseCase(mockSocket, initialRequest);
		mockRoomPositionChanged.set(roomId, false);

		// When: 다른 위치로 이동
		const newPositionRequest: C2SPositionUpdateRequest = {
			x: 300,
			y: 400,
		};

		const result = await positionUpdateUseCase(mockSocket, newPositionRequest);

		// Then: 성공하고 플래그가 설정됨
		expect(result).toBe(true);
		expect(mockRoomPositionChanged.get(roomId)).toBe(true);

		// 새로운 위치가 저장되었는지 확인
		const roomMap = mockNotificationCharacterPosition.get(roomId);
		const positionData = roomMap!.get(userId);
		expect(positionData).toEqual({
			id: userId,
			x: 300,
			y: 400,
		});
	});



	// 헬퍼 함수
	function createMockSocket(userId: string | undefined, roomId: string | undefined): GameSocket {
		return {
			userId,
			roomId,
		} as any;
	}

});
