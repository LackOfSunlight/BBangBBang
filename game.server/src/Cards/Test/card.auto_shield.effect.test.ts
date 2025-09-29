import { CardType, CharacterType, RoleType, RoomStateType } from '../../Generated/common/enums';
import { cardManager } from '../../Managers/card.manager';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../Utils/room.utils';
import cardAutoShieldEffect, { autoShieldBlock } from '../Equip/card.auto_shield.effect';
import { Character } from '../../Models/character.model';

// 의존성 모의(Mock) 설정
jest.mock('../../utils/room.utils', () => ({
	getRoom: jest.fn(),
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));
jest.mock('../../managers/card.manager');

// 모의 함수(Mock Function) 정의
const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;
const mockGetRoom = getRoom as jest.Mock;

describe('cardAutoShieldEffect', () => {
	const roomId = 1;
	const userId = 'user-1';
	let mockRoom: Room;
	let mockUser: User;

	beforeEach(() => {
		jest.clearAllMocks();

		mockUser = new User(userId, 'Test User');
		mockUser.character = new Character(
			CharacterType.RED,
			RoleType.NONE_ROLE,
			4,
			0,
			[],
			[],
			[],
			1,
			0,
		);
		mockRoom = new Room(roomId, mockUser.id, 'test-room', 2, RoomStateType.INGAME, [mockUser]);

		mockGetRoom.mockReturnValue(mockRoom);
		mockGetUserFromRoom.mockReturnValue(mockUser);
	});

	// --- 유효성 검증 테스트 ---
	it('유저를 찾을 수 없으면 false를 반환해야 한다', () => {
		// 준비
		mockGetUserFromRoom.mockReturnValue(null);
		// 실행
		const result = cardAutoShieldEffect(roomId, userId);
		// 검증
		expect(result).toBe(false);
		expect(cardManager.removeCard).not.toHaveBeenCalled();
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	it('유저에게 캐릭터 정보가 없으면 false를 반환해야 한다', () => {
		// 준비
		mockUser.character = undefined;
		// 실행
		const result = cardAutoShieldEffect(roomId, userId);
		// 검증
		expect(result).toBe(false);
		expect(cardManager.removeCard).not.toHaveBeenCalled();
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	// --- 성공 시나리오 ---
	it('자동 방패를 장착하고 있지 않으면, equips에 추가하고 true를 반환해야 한다', () => {
		// 실행
		const result = cardAutoShieldEffect(roomId, userId);

		// 검증
		expect(result).toBe(true);
		expect(cardManager.removeCard).toHaveBeenCalledTimes(1);
		expect(mockUser.character!.equips).toContain(CardType.AUTO_SHIELD);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, mockUser.character);
	});

	// --- 실패 시나리오 ---
	it('이미 자동 방패를 장착하고 있으면, false를 반환해야 한다', () => {
		// 준비: 자동 방패를 미리 장착
		mockUser.character!.equips.push(CardType.AUTO_SHIELD);

		// 실행
		const result = cardAutoShieldEffect(roomId, userId);

		// 검증
		expect(result).toBe(false);
		expect(cardManager.removeCard).not.toHaveBeenCalled();
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	it('DB 업데이트 실패 시 false를 반환해야 한다', () => {
		// 준비
		const dbError = new Error('Redis connection failed');
		mockUpdateCharacterFromRoom.mockImplementation(() => {
			throw dbError;
		});
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

		// 실행
		const result = cardAutoShieldEffect(roomId, userId);

		// 검증
		expect(result).toBe(false);
		expect(cardManager.removeCard).toHaveBeenCalledTimes(1); // 카드 제거는 먼저 실행됨
		expect(consoleErrorSpy).toHaveBeenCalledWith('[자동 방패] 처리 중 에러 발생:', dbError);
		consoleErrorSpy.mockRestore();
	});
});

describe('autoShieldBlock', () => {
	let randomMock: jest.SpyInstance;

	afterEach(() => {
		if (randomMock) randomMock.mockRestore();
	});

	it('Math.random()이 0.25보다 작으면 true를 반환해야 한다', () => {
		randomMock = jest.spyOn(Math, 'random').mockReturnValue(0.1);
		expect(autoShieldBlock()).toBe(true);
	});

	it('Math.random()이 0.25보다 크거나 같으면 false를 반환해야 한다', () => {
		randomMock = jest.spyOn(Math, 'random').mockReturnValue(0.5);
		expect(autoShieldBlock()).toBe(false);

		randomMock.mockReturnValue(0.25);
		expect(autoShieldBlock()).toBe(false);
	});
});
