import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CardType } from '../../generated/common/enums';
import cardStealthSuitEffect from '../card.stealth_suit.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { User } from '../../models/user.model';
import { CharacterData } from '../../generated/common/types';

jest.mock('../../utils/room.utils', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;

describe('cardStealthSuitEffect', () => {
	const ROOM_ID = 1;
	const USER_ID = 'user-1';
	let mockUser: User;

	beforeEach(() => {
		jest.clearAllMocks();

		// 테스트를 위한 사용자 설정
		mockUser = new User(USER_ID, 'TestUser');
		mockUser.character = {
			characterType: 0,
			roleType: 0,
			hp: 4,
			weapon: 0,
			equips: [],
			debuffs: [],
			handCards: [],
			handCardsCount: 0,
			stateInfo: { state: 0, stateTargetUserId: '', nextState: 0, nextStateAt: '0' },
			bbangCount: 0,
		} as CharacterData;

		// 기본 동기화 동작 설정
		mockGetUserFromRoom.mockReturnValue(mockUser);
		mockUpdateCharacterFromRoom.mockImplementation(() => {});
	});

	it('성공적으로 스텔스 장치를 장착하고 true를 반환해야 합니다', () => {
		mockUser.character!.equips = [];

		// Act
		const result = cardStealthSuitEffect(ROOM_ID, USER_ID);

		// Assert
		expect(result).toBe(true);
		expect(mockUser.character!.equips).toEqual([CardType.STEALTH_SUIT]);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(ROOM_ID, USER_ID, mockUser.character);
	});

	it('이미 스텔스 장치를 가지고 있다면, 교체하고 true를 반환해야 합니다', () => {
		mockUser.character!.equips = [CardType.SHIELD, CardType.STEALTH_SUIT, CardType.VACCINE];

		// Act
		const result = cardStealthSuitEffect(ROOM_ID, USER_ID);

		// Assert
		expect(result).toBe(true);
		// 원래의 슈트가 제거되고 끝에 새로운 슈트가 추가됩니다
		expect(mockUser.character!.equips).toEqual([CardType.SHIELD, CardType.VACCINE, CardType.STEALTH_SUIT]);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(1);
	});

	it('유저를 찾을 수 없으면 false를 반환해야 합니다', () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		const notFoundError = new Error('User not found');
		mockGetUserFromRoom.mockImplementation(() => {
			throw notFoundError;
		});

		// Act
		const result = cardStealthSuitEffect(ROOM_ID, USER_ID);

		// Assert
		expect(result).toBe(false);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		expect(consoleErrorSpy).toHaveBeenCalledWith('[스텔스 장치] 처리 중 오류 발생:', notFoundError);
		consoleErrorSpy.mockRestore();
	});

	it('유저의 캐릭터 정보가 없으면 false를 반환해야 합니다', () => {
		const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		mockUser.character = undefined;

		// Act
		const result = cardStealthSuitEffect(ROOM_ID, USER_ID);

		// Assert
		expect(result).toBe(false);
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		expect(consoleWarnSpy).toHaveBeenCalledWith(`[스텔스 장치] 유저의 캐릭터 정보가 없습니다: ${USER_ID}`);
		consoleWarnSpy.mockRestore();
	});

	it('캐릭터 정보 업데이트에 실패하면 false를 반환해야 합니다', () => {
		const dbError = new Error('DB update failed');
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		mockUpdateCharacterFromRoom.mockImplementation(() => {
			throw dbError;
		});

		// Act
		const result = cardStealthSuitEffect(ROOM_ID, USER_ID);

		// Assert
		expect(result).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith('[스텔스 장치] 처리 중 오류 발생:', dbError);
		consoleErrorSpy.mockRestore();
	});
});