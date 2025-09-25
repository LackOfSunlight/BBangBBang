import { cardManager } from '../../managers/card.manager';
import cardVaccineEffect from '../active/card.vaccine.effect';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import getMaxHp from '../../init/character.Init';
import { User } from '../../models/user.model';
import { Character } from '../../models/character.model';
import { CharacterType, RoleType, RoomStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';

// 의존성 모의(Mock) 설정
jest.mock('../../utils/room.utils', () => ({
	getRoom: jest.fn(),
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

jest.mock('../../utils/character.util', () => ({
	__esModule: true, // default export
	default: jest.fn(),
}));

jest.mock('../../managers/card.manager');

// 모의 함수(Mock Function) 정의
const mockGetRoom = getRoom as jest.Mock;
const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;
const mockGetMaxHp = getMaxHp as jest.Mock;

describe('cardVaccineEffect', () => {
	const roomId = 1;
	const userId = 'user1';

	let user: User;
	let room: Room;

	beforeEach(() => {
		// 각 테스트 실행 전 모의 객체 초기화
		jest.clearAllMocks();

		// 모의 객체의 기본 구현 설정
		user = new User(userId, 'test-socket');
		room = new Room(roomId, user.id, 'test-room', 2, RoomStateType.INGAME, [user]);
		mockGetUserFromRoom.mockReturnValue(user);
		mockGetRoom.mockReturnValue(room);
		mockUpdateCharacterFromRoom.mockImplementation(() => {});
		mockGetMaxHp.mockImplementation((charType: CharacterType) => {
			if (charType === CharacterType.DINOSAUR) return 3;
			return 4; // RED 등 다른 캐릭터의 기본 최대 체력
		});
	});

	test('체력이 최대치보다 낮을 때 true를 반환하고 체력이 1 회복되어야 합니다.', () => {
		// 준비 (Given): 캐릭터의 현재 체력이 최대 체력보다 낮음 (3/4)
		user.character = new Character(CharacterType.RED, RoleType.NONE_ROLE, 3, 0, [], [], [], 1, 0);

		// 실행 (When): 백신 카드 효과를 적용
		const result = cardVaccineEffect(roomId, userId);

		// 검증 (Then): true를 반환하고, 카드가 제거되며, 체력이 1 증가해야 함
		expect(result).toBe(true);
		expect(cardManager.removeCard).toHaveBeenCalledTimes(1);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(1);
		expect(user.character.hp).toBe(4);
	});

	test('체력이 최대치일 때 false를 반환하고 회복되지 않아야 합니다.', () => {
		// 준비 (Given): 캐릭터의 현재 체력이 최대 체력과 같음 (4/4)
		user.character = new Character(CharacterType.RED, RoleType.NONE_ROLE, 4, 0, [], [], [], 1, 0);

		// 실행 (When): 백신 카드 효과를 적용
		const result = cardVaccineEffect(roomId, userId);

		// 검증 (Then): false를 반환하고, 카드가 제거되지 않으며, 체력도 변하지 않아야 함
		expect(result).toBe(false);
		expect(cardManager.removeCard).not.toHaveBeenCalled();
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		expect(user.character.hp).toBe(4);
	});

	test('최대 체력이 3인 캐릭터(공룡)가 체력을 회복해야 합니다.', () => {
		// 준비 (Given): 공룡 캐릭터의 현재 체력이 최대 체력보다 낮음 (2/3)
		user.character = new Character(
			CharacterType.DINOSAUR,
			RoleType.NONE_ROLE,
			2,
			0,
			[],
			[],
			[],
			1,
			0,
		);

		// 실행 (When): 백신 카드 효과를 적용
		const result = cardVaccineEffect(roomId, userId);

		// 검증 (Then): true를 반환하고, 카드가 제거되며, 체력이 1 증가해야 함
		expect(result).toBe(true);
		expect(cardManager.removeCard).toHaveBeenCalledTimes(1);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(1);
		expect(user.character.hp).toBe(3);
	});

	test('최대 체력이 3인 캐릭터(공룡)가 최대 체력일 때 회복하지 않아야 합니다.', () => {
		// 준비 (Given): 공룡 캐릭터의 현재 체력이 최대 체력과 같음 (3/3)
		user.character = new Character(
			CharacterType.DINOSAUR,
			RoleType.NONE_ROLE,
			3,
			0,
			[],
			[],
			[],
			1,
			0,
		);

		// 실행 (When): 백신 카드 효과를 적용
		const result = cardVaccineEffect(roomId, userId);

		// 검증 (Then): false를 반환하고, 카드가 제거되지 않으며, 체력도 변하지 않아야 함
		expect(result).toBe(false);
		expect(cardManager.removeCard).not.toHaveBeenCalled();
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		expect(user.character.hp).toBe(3);
	});

	test('유저를 찾을 수 없을 때 false를 반환해야 합니다.', () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		const notFoundError = new Error('User not found');
		// 준비 (Given): getUserFromRoom 함수가 에러를 발생시키도록 설정
		mockGetUserFromRoom.mockImplementation(() => {
			throw notFoundError;
		});

		// 실행 (When): 백신 카드 효과를 적용
		const result = cardVaccineEffect(roomId, userId);

		// 검증 (Then): false를 반환하고, 에러 로그가 출력되어야 함
		expect(result).toBe(false);
		expect(cardManager.removeCard).not.toHaveBeenCalled();
		expect(consoleErrorSpy).toHaveBeenCalledWith('[백신] 처리 중 오류 발생:', notFoundError);
		consoleErrorSpy.mockRestore();
	});

	test('캐릭터가 없을 때 false를 반환해야 합니다.', () => {
		const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		// 준비 (Given): 유저의 캐릭터 정보가 없는 상태로 설정
		user.character = undefined;

		// 실행 (When): 백신 카드 효과를 적용
		const result = cardVaccineEffect(roomId, userId);

		// 검증 (Then): false를 반환하고, 경고 로그가 출력되어야 함
		expect(result).toBe(false);
		expect(cardManager.removeCard).not.toHaveBeenCalled();
		expect(consoleWarnSpy).toHaveBeenCalledWith(`[백신] 유저의 캐릭터 정보가 없습니다: ${userId}`);
		consoleWarnSpy.mockRestore();
	});

	test('DB 업데이트 실패 시 false를 반환해야 합니다.', () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		const updateError = new Error('Update failed');
		// 준비 (Given): 체력은 회복 가능하지만, DB 업데이트 시 에러가 발생하도록 설정
		user.character = new Character(CharacterType.RED, RoleType.NONE_ROLE, 3, 0, [], [], [], 1, 0);
		mockUpdateCharacterFromRoom.mockImplementation(() => {
			throw updateError;
		});

		// 실행 (When): 백신 카드 효과를 적용
		const result = cardVaccineEffect(roomId, userId);

		// 검증 (Then): false를 반환하지만, 카드는 제거되어야 함
		expect(result).toBe(false);
		expect(cardManager.removeCard).toHaveBeenCalledTimes(1);
		// 메모리 상의 객체는 변경되지만, 함수는 false를 반환하고 에러 로그를 남김
		expect(user.character.hp).toBe(4);
		expect(consoleErrorSpy).toHaveBeenCalledWith('[백신] 처리 중 오류 발생:', updateError);
		consoleErrorSpy.mockRestore();
	});
});
