import { CardType, CharacterStateType } from '../../generated/common/enums';
import { cardManager } from '../../Managers/card.manager';
import { User } from '../../Models/user.model';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../Utils/room.utils';
import cardHallucinationEffect from '../Active/card.hallucination.effect';

// Mock dependencies
jest.mock('../../utils/room.utils');
jest.mock('../../managers/card.manager');

// Cast mocks to the correct type
const mockGetRoom = getRoom as jest.Mock;
const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;

describe('cardHallucinationEffect', () => {
	let user: User;
	let target: User;
	const roomId = 1;
	const userId = 'user-1';
	const targetId = 'target-1';
	let consoleLogSpy: jest.SpyInstance;
	let consoleErrorSpy: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();

		// Mock console to prevent logs during tests
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

		// Setup default user and target data
		user = new User(userId, 'User');
		user.character = {
			handCards: [],
			stateInfo: {
				state: CharacterStateType.NONE_CHARACTER_STATE,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: 0,
				stateTargetUserId: '0',
			},
		} as any;

		target = new User(targetId, 'Target');
		target.character = {
			handCards: [
				{ type: CardType.HAND_GUN, count: 1 },
				{ type: CardType.SHIELD, count: 3 },
			],
			stateInfo: {
				state: CharacterStateType.NONE_CHARACTER_STATE,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: 0,
				stateTargetUserId: '0',
			},
		} as any;

		// Default mock implementation
		mockGetRoom.mockReturnValue({ id: roomId, users: [user, target] });
		mockGetUserFromRoom.mockImplementation((roomId, id) => {
			if (id === userId) return user;
			if (id === targetId) return target;
			return null;
		});
	});

	afterEach(() => {
		// Restore mocks
		consoleLogSpy.mockRestore();
		consoleErrorSpy.mockRestore();
	});

	// --- Validation and Edge Case Tests ---

	it('유저 또는 타겟을 찾을 수 없으면 false를 반환해야 한다', () => {
		mockGetUserFromRoom.mockReturnValue(null);
		expect(cardManager.removeCard).toHaveBeenCalledTimes(0);
		expect(cardHallucinationEffect(roomId, userId, targetId)).toBe(false);
	});

	it('타겟이 감금 상태이면 false를 반환해야 한다', () => {
		target.character!.stateInfo!.state = CharacterStateType.CONTAINED;
		const result = cardHallucinationEffect(roomId, userId, targetId);
		expect(result).toBe(false);
		expect(cardManager.removeCard).toHaveBeenCalledTimes(0);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	it('타겟이 카드를 가지고 있지 않으면 false를 반환해야 한다', () => {
		target.character!.handCards = [];
		const result = cardHallucinationEffect(roomId, userId, targetId);
		expect(result).toBe(false);
		expect(cardManager.removeCard).toHaveBeenCalledTimes(0);
		expect(consoleLogSpy).toHaveBeenCalled();
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	// --- Success Scenarios ---

	it('신기루 카드를 성공적으로 사용해야 한다', () => {
		const result = cardHallucinationEffect(roomId, userId, targetId);

		expect(result).toBe(true);
		expect(cardManager.removeCard).toHaveBeenCalledWith(
			user,
			expect.any(Object),
			CardType.HALLUCINATION,
		);

		// 상태 변경 확인
		expect(user.character!.stateInfo!.state).toBe(CharacterStateType.HALLUCINATING);
		expect(user.character!.stateInfo!.stateTargetUserId).toBe(targetId);
		expect(target.character!.stateInfo!.state).toBe(CharacterStateType.HALLUCINATION_TARGET);

		// 업데이트 호출 확인
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(2);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, user.character);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, targetId, target.character);
	});

	// --- Failure Scenario ---

	it('DB 업데이트 중 에러가 발생하면 false를 반환해야 한다', () => {
		const dbError = new Error('Redis connection failed');
		mockUpdateCharacterFromRoom.mockImplementation(() => {
			throw dbError;
		});

		const result = cardHallucinationEffect(roomId, userId, targetId);

		expect(result).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(`[신기루] 업데이트 실패:`, dbError);
	});
});
