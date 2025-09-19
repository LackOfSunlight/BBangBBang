import { equipAutoShieldEffect, autoShieldBlock } from '../card.auto_shield.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { User } from '../../models/user.model';
import {
	CardType,
	CharacterType,
	RoleType,
	CharacterStateType,
} from '../../generated/common/enums';

// 함수의 직접적인 의존성인 room.utils를 모킹합니다.
jest.mock('../../utils/room.utils', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

// 타입스크립트와 함께 사용하기 위해 모킹된 함수를 캐스팅합니다.
const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;

describe('equipAutoShieldEffect', () => {
	const ROOM_ID = 1;
	const USER_ID = 'user-1';
	let mockUser: User;

	beforeEach(() => {
		// 각 테스트가 독립적으로 실행되도록 모든 모의 함수를 초기화합니다.
		jest.clearAllMocks();

		// 테스트에 사용할 기본 유저 객체를 설정합니다.
		mockUser = new User(USER_ID, 'test-user');
		mockUser.character = {
			characterType: CharacterType.PINK_SLIME,
			roleType: RoleType.HITMAN,
			hp: 4,
			weapon: CardType.NONE,
			equips: [], // 장착 아이템 없이 시작
			debuffs: [],
			handCards: [],
			handCardsCount: 0,
			stateInfo: {
				state: CharacterStateType.NONE_CHARACTER_STATE,
				stateTargetUserId: '',
				nextState: 0,
				nextStateAt: '0',
			},
			bbangCount: 0,
		};

		// 모의 함수의 기본 동작을 동기식으로 설정합니다.
		mockGetUserFromRoom.mockReturnValue(mockUser);
		mockUpdateCharacterFromRoom.mockImplementation(() => {});
	});

	it('자동 쉴드를 장착하고 있지 않을 때, 성공적으로 장착하고 true를 반환해야 합니다', () => {
		// Act
		const result = equipAutoShieldEffect(ROOM_ID, USER_ID);

		// Assert
		expect(result).toBe(true);
		expect(mockGetUserFromRoom).toHaveBeenCalledWith(ROOM_ID, USER_ID);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(
			ROOM_ID,
			USER_ID,
			expect.objectContaining({
				equips: expect.arrayContaining([CardType.AUTO_SHIELD]),
			}),
		);
	});

	it('유저를 찾을 수 없으면 false를 반환해야 합니다', () => {
		// Arrange
		mockGetUserFromRoom.mockReturnValue(null);

		// Act
		const result = equipAutoShieldEffect(ROOM_ID, USER_ID);

		// Assert
		expect(result).toBe(false);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	it('유저의 캐릭터 정보가 없으면 false를 반환해야 합니다', () => {
		// Arrange
		mockUser.character = undefined;
		mockGetUserFromRoom.mockReturnValue(mockUser);

		// Act
		const result = equipAutoShieldEffect(ROOM_ID, USER_ID);

		// Assert
		expect(result).toBe(false);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});
});

describe('autoShieldBlock', () => {
	let randomSpy: jest.SpyInstance;

	afterEach(() => {
		// 각 테스트 후 Math.random의 원래 구현으로 복원합니다.
		randomSpy.mockRestore();
	});

	it('Math.random()이 0.25보다 작으면 true를 반환해야 합니다 (방어 성공)', () => {
		// Arrange: Math.random이 0.25보다 작은 값을 반환하도록 모킹합니다.
		randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1);

		// Act
		const result = autoShieldBlock();

		// Assert
		expect(result).toBe(true);
	});

	it('Math.random()이 0.25와 같으면 false를 반환해야 합니다 (방어 실패)', () => {
		// Arrange: Math.random이 0.25를 반환하도록 모킹합니다.
		randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.25);

		// Act
		const result = autoShieldBlock();

		// Assert
		expect(result).toBe(false);
	});

	it('Math.random()이 0.25보다 크면 false를 반환해야 합니다 (방어 실패)', () => {
		// Arrange: Math.random이 0.25보다 큰 값을 반환하도록 모킹합니다.
		randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.8);

		// Act
		const result = autoShieldBlock();

		// Assert
		expect(result).toBe(false);
	});
});
