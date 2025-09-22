import { CardType } from '../../generated/common/enums';
import { removeCard } from '../../managers/card.manager';
import { User } from '../../models/user.model';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import cardAbsorbEffect from '../active/card.absorb.effect';

// Mock dependencies
jest.mock('../../utils/room.utils');
jest.mock('../../managers/card.manager', () => ({
	removeCard: jest.fn(),
}));

// Cast mocks to the correct type
const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;
const mockRemoveCard = removeCard as jest.Mock;


describe('cardAbsorbEffect', () => {
	let user: User;
	let target: User;
	const roomId = 1;
	const userId = 'user-1';
	const targetId = 'target-1';
	let randomMock: jest.SpyInstance;
	let consoleLogSpy: jest.SpyInstance;
	let consoleErrorSpy: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();

		// Mock console to prevent logs during tests
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

		// Setup default user and target data
		user = new User(userId, 'User');
		user.character = { handCards: [] } as any;

		target = new User(targetId, 'Target');
		target.character = {
			handCards: [
				{ type: CardType.HAND_GUN, count: 1 },
				{ type: CardType.SHIELD, count: 3 },
			],
		} as any;

		// Default mock implementation
		mockGetUserFromRoom.mockImplementation((roomId, id) => {
			if (id === userId) return user;
			if (id === targetId) return target;
			return null;
		});
	});

	afterEach(() => {
		// Restore mocks
		if (randomMock) randomMock.mockRestore();
		consoleLogSpy.mockRestore();
		consoleErrorSpy.mockRestore();
	});

	// --- Validation and Edge Case Tests ---

	it('유저 또는 타겟을 찾을 수 없으면 false를 반환해야 한다', () => {
		mockGetUserFromRoom.mockReturnValue(null);
		expect(mockRemoveCard).toHaveBeenCalledTimes(0)
		expect(cardAbsorbEffect(roomId, userId, targetId)).toBe(false);
	});

	it('타겟이 카드를 가지고 있지 않으면 false를 반환해야 한다', () => {
		target.character!.handCards = [];
		const result = cardAbsorbEffect(roomId, userId, targetId);
		expect(result).toBe(false);
		expect(mockRemoveCard).toHaveBeenCalledTimes(0)
		expect(consoleLogSpy).toHaveBeenCalled();
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	// --- Success Scenarios ---

	it('타겟의 카드 1장을 성공적으로 훔쳐야 한다 (count: 1)', () => {
		// Mock Math.random to always select the first card (HAND_GUN)
		randomMock = jest.spyOn(Math, 'random').mockReturnValue(0);

		const result = cardAbsorbEffect(roomId, userId, targetId);

		expect(result).toBe(true);
		expect(mockRemoveCard).toHaveBeenCalledTimes(1)
		// Target should lose the hand gun
		expect(target.character!.handCards.some((c) => c.type === CardType.HAND_GUN)).toBe(false);
		// User should gain the hand gun
		expect(user.character!.handCards).toContainEqual({ type: CardType.HAND_GUN, count: 1 });
		// Both users should be updated
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(2);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, user.character);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, targetId, target.character);
	});

	it('타겟의 카드 묶음에서 1장을 성공적으로 훔쳐야 한다 (count > 1)', () => {
		// Mock Math.random to always select the second card (SHIELD)
		randomMock = jest.spyOn(Math, 'random').mockReturnValue(0.5);

		const result = cardAbsorbEffect(roomId, userId, targetId);

		expect(result).toBe(true);
		expect(mockRemoveCard).toHaveBeenCalledTimes(1)
		// Target's shield count should decrease
		expect(target.character!.handCards.find((c) => c.type === CardType.SHIELD)?.count).toBe(2);
		// User should gain one shield
		expect(user.character!.handCards).toContainEqual({ type: CardType.SHIELD, count: 1 });
		// Both users should be updated
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(2);
	});

	// --- Failure Scenario ---

	it('DB 업데이트 중 에러가 발생하면 false를 반환해야 한다', () => {
		randomMock = jest.spyOn(Math, 'random').mockReturnValue(0);
		const dbError = new Error('Redis connection failed');
		mockUpdateCharacterFromRoom.mockImplementation(() => {
			throw dbError;
		});

		const result = cardAbsorbEffect(roomId, userId, targetId);

		expect(result).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(`[흡수] 업데이트 실패:`, dbError);
	});
});