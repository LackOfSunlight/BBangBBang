import { CardType } from '../../generated/common/enums';
import { User } from '../../models/user.model';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import cardRaderEffect from '../card.rader.effect';

// Mock dependencies
jest.mock('../../utils/room.utils');

// Cast mocks to the correct type
const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;

describe('cardRaderEffect', () => {
	let mockUser: User;
	const roomId = 1;
	const userId = '1';

	beforeEach(() => {
		// Clear all mocks before each test
		jest.clearAllMocks();

		// Setup default user data
		mockUser = new User(userId, 'TestUser');
		mockUser.character = {
			hp: 4,
			equips: [],
			handCards: [],
		} as any;

		// Default mock implementation
		mockGetUserFromRoom.mockReturnValue(mockUser);
	});

	// --- Validation Tests ---

	it('유저를 찾을 수 없으면 false를 반환해야 한다', () => {
		mockGetUserFromRoom.mockReturnValue(null);
		const result = cardRaderEffect(roomId, userId);
		expect(result).toBe(false);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	it('유저에게 캐릭터 정보가 없으면 false를 반환해야 한다', () => {
		mockUser.character = undefined;
		const result = cardRaderEffect(roomId, userId);
		expect(result).toBe(false);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	// --- Success Scenario ---

	it('레이더를 장착하고 있지 않으면, equips에 추가하고 true를 반환해야 한다', () => {
		const result = cardRaderEffect(roomId, userId);

		expect(result).toBe(true);
		expect(mockUser.character!.equips).toContain(CardType.RADAR);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, mockUser.character);
	});

	// --- Failure Scenarios ---

	it('이미 레이더를 장착하고 있으면, false를 반환해야 한다', () => {
		// Pre-equip the radar
		mockUser.character!.equips.push(CardType.RADAR);

		const result = cardRaderEffect(roomId, userId);

		expect(result).toBe(false);
		// The character should not be updated again
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	it('updateCharacterFromRoom에서 에러가 발생하면, false를 반환하고 콘솔에 에러를 기록해야 한다', () => {
		const dbError = new Error('Redis connection failed');
		mockUpdateCharacterFromRoom.mockImplementation(() => {
			throw dbError;
		});

		// Spy on console.error to check if it's called
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

		const result = cardRaderEffect(roomId, userId);

		expect(result).toBe(false);
		// Check if console.error was called with the expected message
		expect(consoleErrorSpy).toHaveBeenCalledWith(`[레이더] Redis 업데이트 실패:`, dbError);

		// Restore original console.error
		consoleErrorSpy.mockRestore();
	});
});
