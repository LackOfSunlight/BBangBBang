import cardVaccineEffect from '../card.vaccine.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import getMaxHp from '../../utils/character.util';
import { User } from '../../models/user.model';
import { Character } from '../../models/character.model';
import { CharacterType, RoleType } from '../../generated/common/enums';

// Mocks
jest.mock('../../utils/room.utils', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

jest.mock('../../utils/character.util', () => ({
	__esModule: true, // for default export
	default: jest.fn(),
}));

const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;
const mockGetMaxHp = getMaxHp as jest.Mock;

describe('cardVaccineEffect', () => {
	const roomId = 1;
	const userId = 'user1';

	let user: User;

	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();

		// Default mock implementations
		user = new User(userId, 'test-socket');
		mockGetUserFromRoom.mockReturnValue(user);
		mockUpdateCharacterFromRoom.mockImplementation(() => {});
		mockGetMaxHp.mockImplementation((charType: CharacterType) => {
			if (charType === CharacterType.DINOSAUR) return 3;
			return 4; // Default for RED, etc.
		});
	});

	test('체력이 최대치보다 낮을 때 true를 반환하고 체력이 1 회복되어야 합니다.', () => {
		// GIVEN: Character with HP 3/4
		user.character = new Character(CharacterType.RED, RoleType.NONE_ROLE, 3, 0, [], [], [], 1, 0);

		// WHEN
		const result = cardVaccineEffect(roomId, userId);

		// THEN
		expect(result).toBe(true);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(1);
		expect(user.character.hp).toBe(4);
	});

	test('체력이 최대치일 때 false를 반환하고 회복되지 않아야 합니다.', () => {
		// GIVEN: Character with HP 4/4
		user.character = new Character(CharacterType.RED, RoleType.NONE_ROLE, 4, 0, [], [], [], 1, 0);

		// WHEN
		const result = cardVaccineEffect(roomId, userId);

		// THEN
		expect(result).toBe(false);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		expect(user.character.hp).toBe(4);
	});

	test('최대 체력이 3인 캐릭터(공룡)가 체력을 회복해야 합니다.', () => {
		// GIVEN: Dinosaur with HP 2/3
		user.character = new Character(CharacterType.DINOSAUR, RoleType.NONE_ROLE, 2, 0, [], [], [], 1, 0);

		// WHEN
		const result = cardVaccineEffect(roomId, userId);

		// THEN
		expect(result).toBe(true);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(1);
		expect(user.character.hp).toBe(3);
	});

	test('최대 체력이 3인 캐릭터(공룡)가 최대 체력일 때 회복하지 않아야 합니다.', () => {
		// GIVEN: Dinosaur with HP 3/3
		user.character = new Character(CharacterType.DINOSAUR, RoleType.NONE_ROLE, 3, 0, [], [], [], 1, 0);

		// WHEN
		const result = cardVaccineEffect(roomId, userId);

		// THEN
		expect(result).toBe(false);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		expect(user.character.hp).toBe(3);
	});

	test('유저를 찾을 수 없을 때 false를 반환해야 합니다.', () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		const notFoundError = new Error('User not found');
		// GIVEN
		mockGetUserFromRoom.mockImplementation(() => {
			throw notFoundError;
		});

		// WHEN
		const result = cardVaccineEffect(roomId, userId);

		// THEN
		expect(result).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith('[백신] 처리 중 오류 발생:', notFoundError);
		consoleErrorSpy.mockRestore();
	});

	test('캐릭터가 없을 때 false를 반환해야 합니다.', () => {
		const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		// GIVEN
		user.character = undefined;

		// WHEN
		const result = cardVaccineEffect(roomId, userId);

		// THEN
		expect(result).toBe(false);
		expect(consoleWarnSpy).toHaveBeenCalledWith(`[백신] 유저의 캐릭터 정보가 없습니다: ${userId}`);
		consoleWarnSpy.mockRestore();
	});

	test('DB 업데이트 실패 시 false를 반환해야 합니다.', () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		const updateError = new Error('Update failed');
		// GIVEN
		user.character = new Character(CharacterType.RED, RoleType.NONE_ROLE, 3, 0, [], [], [], 1, 0);
		mockUpdateCharacterFromRoom.mockImplementation(() => {
			throw updateError;
		});

		// WHEN
		const result = cardVaccineEffect(roomId, userId);

		// THEN
		expect(result).toBe(false);
		// The in-memory object is still mutated, but the function returns false
		expect(user.character.hp).toBe(4);
		expect(consoleErrorSpy).toHaveBeenCalledWith('[백신] 처리 중 오류 발생:', updateError);
		consoleErrorSpy.mockRestore();
	});
});