import cardDesertEagleEffect from '../card.desert_eagle.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { User } from '../../models/user.model';
import {
	CardType,
	CharacterType,
	RoleType,
	CharacterStateType,
} from '../../generated/common/enums';
import { CharacterData } from '../../generated/common/types';

// cardDesertEagleEffect 함수의 직접적인 의존성인 room.utils를 모킹합니다.
jest.mock('../../utils/room.utils', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

// 타입스크립트와 함께 사용하기 위해 모킹된 함수를 캐스팅합니다.
const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;

describe('cardDesertEagleEffect', () => {
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
			equips: [],
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
		} as CharacterData;

		// 모의 함수의 기본 동작을 동기적으로 설정합니다.
		mockGetUserFromRoom.mockReturnValue(mockUser);
		mockUpdateCharacterFromRoom.mockImplementation(() => {}); // void 함수
	});

	it('성공적으로 데저트 이글을 장착하고 true를 반환해야 합니다', () => {
		// Act: 테스트할 함수를 실행합니다.
		const result = cardDesertEagleEffect(ROOM_ID, USER_ID);

		// Assert: 결과를 검증합니다.
		expect(result).toBe(true);
		expect(mockGetUserFromRoom).toHaveBeenCalledWith(ROOM_ID, USER_ID);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(
			ROOM_ID,
			USER_ID,
			expect.objectContaining({
				weapon: CardType.DESERT_EAGLE, // 무기가 데저트 이글로 설정되었는지 확인
			}),
		);
	});

	it('기존에 다른 무기를 가지고 있었다면, 덮어써야 합니다', () => {
		// Arrange: 유저가 이미 다른 무기를 가지고 있는 상황을 설정합니다.
		mockUser.character!.weapon = CardType.HAND_GUN;

		// Act
		const result = cardDesertEagleEffect(ROOM_ID, USER_ID);

		// Assert
		expect(result).toBe(true);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(
			ROOM_ID,
			USER_ID,
			expect.objectContaining({
				weapon: CardType.DESERT_EAGLE, // 기존 무기가 데저트 이글로 교체되었는지 확인
			}),
		);
	});

	it('유저를 찾을 수 없으면 false를 반환해야 합니다', () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		const notFoundError = new Error('User not found');
		// Arrange: 유저를 찾을 수 없는 상황 (에러 발생)을 설정합니다.
		mockGetUserFromRoom.mockImplementation(() => {
			throw notFoundError;
		});

		// Act
		const result = cardDesertEagleEffect(ROOM_ID, USER_ID);

		// Assert
		expect(result).toBe(false);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled(); // 캐릭터 업데이트 함수가 호출되지 않았는지 확인
		expect(consoleErrorSpy).toHaveBeenCalledWith('[데저트 이글] 업데이트 실패:', notFoundError);
		consoleErrorSpy.mockRestore();
	});

	it('유저의 캐릭터 정보가 없으면 false를 반환해야 합니다', () => {
		// Arrange: 캐릭터 정보가 없는 상황을 설정합니다.
		mockUser.character = undefined;

		// Act
		const result = cardDesertEagleEffect(ROOM_ID, USER_ID);

		// Assert
		expect(result).toBe(false);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	it('캐릭터 정보 업데이트에 실패하면 false를 반환해야 합니다', () => {
		// Arrange: DB 업데이트 실패 상황 (에러 발생)을 설정합니다.
		const dbError = new Error('DB update failed');
		mockUpdateCharacterFromRoom.mockImplementation(() => {
			throw dbError;
		});
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // 테스트 중 콘솔 에러 출력을 막습니다.

		// Act
		const result = cardDesertEagleEffect(ROOM_ID, USER_ID);

		// Assert
		expect(result).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith('[데저트 이글] 업데이트 실패:', dbError); // 에러 로그가 정상적으로 출력되었는지 확인
		consoleErrorSpy.mockRestore();
	});
});