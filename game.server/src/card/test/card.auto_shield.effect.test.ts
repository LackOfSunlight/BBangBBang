import { CardType } from '../../generated/common/enums';
import { User } from '../../models/user.model';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import cardAutoShieldEffect from '../card.auto_shield.effect';

// Mock dependencies
jest.mock('../../utils/room.utils');

// Cast mocks to the correct type
const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;

describe('cardAutoShieldEffect', () => {
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
			equips: [],
			handCards: [],
		} as any;

		// Default mock implementation
		mockGetUserFromRoom.mockReturnValue(mockUser);
	});

	// --- Validation Tests ---

	it('유저를 찾을 수 없으면 false를 반환해야 한다', () => {
		mockGetUserFromRoom.mockReturnValue(null);
		const result = cardAutoShieldEffect(roomId, userId);
		expect(result).toBe(false);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	it('유저에게 캐릭터 정보가 없으면 false를 반환해야 한다', () => {
		mockUser.character = undefined;
		const result = cardAutoShieldEffect(roomId, userId);
		expect(result).toBe(false);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	// --- Success Scenario ---

	it('자동 방패를 장착하고 있지 않으면, equips에 추가하고 true를 반환해야 한다', () => {
		const result = cardAutoShieldEffect(roomId, userId);

		expect(result).toBe(true);
		expect(mockUser.character!.equips).toContain(CardType.AUTO_SHIELD);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, mockUser.character);
	});

	// --- Failure Scenarios ---

	it('이미 자동 방패를 장착하고 있으면, false를 반환해야 한다', () => {
		// Pre-equip the auto shield
		mockUser.character!.equips.push(CardType.AUTO_SHIELD);

		const result = cardAutoShieldEffect(roomId, userId);

		expect(result).toBe(false);
		// The character should not be updated again
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	it('updateCharacterFromRoom에서 에러가 발생하면, 해당 에러를 그대로 발생시켜야 한다', () => {
		const dbError = new Error('Redis connection failed');
		mockUpdateCharacterFromRoom.mockImplementation(() => {
			throw dbError;
		});

		// Expect the function to throw the error
		expect(() => {
			cardAutoShieldEffect(roomId, userId);
		}).toThrow(dbError);
	});
});