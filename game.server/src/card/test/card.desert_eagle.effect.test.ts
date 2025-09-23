import cardDesertEagleEffect from '../weapon/card.desert_eagle.effect';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { User } from '../../models/user.model';
import {
	CardType,
	CharacterType,
	RoleType,
	CharacterStateType,
	RoomStateType,
} from '../../generated/common/enums';
import { CharacterData } from '../../generated/common/types';
import { cardManager } from '../../managers/card.manager';
import { Room } from '../../models/room.model';

// 의존성 모의(Mock) 설정
jest.mock('../../utils/room.utils', () => ({
	getRoom: jest.fn(),
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

jest.mock('../../managers/card.manager');

// 모의 함수(Mock Function) 정의
const mockGetRoom = getRoom as jest.Mock;
const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;

describe('cardDesertEagleEffect', () => {
	const ROOM_ID = 1;
	const USER_ID = 'user-1';
	let mockUser: User;
	let mockRoom: Room;

	beforeEach(() => {
		// 각 테스트 실행 전 모의 객체 초기화
		jest.clearAllMocks();

		// 테스트에 사용할 기본 객체 설정
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
		mockRoom = new Room(ROOM_ID, mockUser.id, 'test-room', 2, RoomStateType.INGAME, [mockUser]);

		// 모의 함수의 기본 동작 설정
		mockGetUserFromRoom.mockReturnValue(mockUser);
		mockGetRoom.mockReturnValue(mockRoom);
		mockUpdateCharacterFromRoom.mockImplementation(() => {}); // void 함수
	});

	it('성공적으로 데저트 이글을 장착하고 true를 반환해야 합니다', () => {
		// 실행: 테스트할 함수를 실행합니다.
		const result = cardDesertEagleEffect(ROOM_ID, USER_ID);

		// 검증: 결과를 검증합니다.
		expect(result).toBe(true);
		expect(cardManager.removeCard).toHaveBeenCalledTimes(1);
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
		// 준비: 유저가 이미 다른 무기를 가지고 있는 상황을 설정합니다.
		mockUser.character!.weapon = CardType.HAND_GUN;

		// 실행
		const result = cardDesertEagleEffect(ROOM_ID, USER_ID);

		// 검증
		expect(result).toBe(true);
		expect(cardManager.removeCard).toHaveBeenCalledTimes(1);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(
			ROOM_ID,
			USER_ID,
			expect.objectContaining({
				weapon: CardType.DESERT_EAGLE, // 기존 무기가 데저트 이글로 교체되었는지 확인
			}),
		);
	});

	it('유저를 찾을 수 없으면 false를 반환해야 합니다', () => {
		// 준비: 유저를 찾을 수 없는 상황 (null 반환)을 설정합니다.
		mockGetUserFromRoom.mockReturnValue(null);

		// 실행
		const result = cardDesertEagleEffect(ROOM_ID, USER_ID);

		// 검증
		expect(result).toBe(false);
		expect(cardManager.removeCard).not.toHaveBeenCalled();
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled(); // 캐릭터 업데이트 함수가 호출되지 않았는지 확인
	});

	it('유저의 캐릭터 정보가 없으면 false를 반환해야 합니다', () => {
		// 준비: 캐릭터 정보가 없는 상황을 설정합니다.
		mockUser.character = undefined;

		// 실행
		const result = cardDesertEagleEffect(ROOM_ID, USER_ID);

		// 검증
		expect(result).toBe(false);
		expect(cardManager.removeCard).not.toHaveBeenCalled();
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	it('캐릭터 정보 업데이트에 실패하면 false를 반환해야 합니다', () => {
		// 준비: DB 업데이트 실패 상황 (에러 발생)을 설정합니다.
		const dbError = new Error('DB update failed');
		mockUpdateCharacterFromRoom.mockImplementation(() => {
			throw dbError;
		});
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // 테스트 중 콘솔 에러 출력을 막습니다.

		// 실행
		const result = cardDesertEagleEffect(ROOM_ID, USER_ID);

		// 검증
		expect(result).toBe(false);
		expect(cardManager.removeCard).toHaveBeenCalledTimes(1); // 업데이트 실패 전 카드 제거는 호출되어야 함
		expect(consoleErrorSpy).toHaveBeenCalledWith('[데저트 이글] 업데이트 실패:', dbError); // 에러 로그가 정상적으로 출력되었는지 확인
		consoleErrorSpy.mockRestore();
	});
});