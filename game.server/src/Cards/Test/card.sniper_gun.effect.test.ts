import { CardType } from '../../Generated/common/enums';
import { User } from '../../Models/user.model';
import { getUserFromRoom, updateCharacterFromRoom } from '../../Utils/room.utils';
import cardSniperGunEffect from '../Weapon/card.sniper_gun.effect';

// Mock dependencies
jest.mock('../../utils/room.utils');

// Cast mocks to the correct type
const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;

describe('cardSniperGunEffect', () => {
	let mockUser: User;
	const roomId = 1;
	const userId = 'user-1';

	beforeEach(() => {
		// Clear all mocks before each test
		jest.clearAllMocks();

		// Setup default user data
		mockUser = new User(userId, 'Test User');
		mockUser.character = {
			hp: 4,
			weapon: CardType.HAND_GUN, // Initially has a hand gun
			equips: [],
			handCards: [],
		} as any;

		// Default mock implementation
		mockGetUserFromRoom.mockReturnValue(mockUser);
	});

	// --- Validation Tests ---

	it('유저를 찾을 수 없으면 false를 반환해야 한다', () => {
		mockGetUserFromRoom.mockReturnValue(null);
		const result = cardSniperGunEffect(roomId, userId);
		expect(result).toBe(false);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	it('유저에게 캐릭터 정보가 없으면 false를 반환해야 한다', () => {
		mockUser.character = undefined;
		const result = cardSniperGunEffect(roomId, userId);
		expect(result).toBe(false);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	// --- Success Scenario ---

	it('유저의 무기를 스나이퍼 건으로 변경하고 true를 반환해야 한다', () => {
		const result = cardSniperGunEffect(roomId, userId);

		expect(result).toBe(true);
		expect(mockUser.character!.weapon).toBe(CardType.SNIPER_GUN);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, mockUser.character);
	});

	// --- Failure Scenario ---

	it('updateCharacterFromRoom에서 에러가 발생하면, false를 반환하고 콘솔에 에러를 기록해야 한다', () => {
		const dbError = new Error('Redis connection failed');
		mockUpdateCharacterFromRoom.mockImplementation(() => {
			throw dbError;
		});

		// Spy on console.error to check if it's called
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

		const result = cardSniperGunEffect(roomId, userId);

		expect(result).toBe(false);
		// Check if console.error was called with the expected message
		expect(consoleErrorSpy).toHaveBeenCalledWith(`[스나이퍼] Redis 업데이트 실패:`, dbError);

		// Restore original console.error
		consoleErrorSpy.mockRestore();
	});
});
