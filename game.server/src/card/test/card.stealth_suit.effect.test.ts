/**
 * 스텔스 장치 카드 효과 테스트
 *
 * 이 테스트는 스텔스 장치 카드 효과가 올바르게 작동하는지 검증합니다.
 *
 * 테스트 시나리오:
 * 1) 기본 장착 로직
 * 2) 중복 착용 방지 및 교체 로직 (첫 번째만 교체)
 * 3) 유효성 검증
 * 4) 에러 처리
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CardType, CharacterStateType } from '../../generated/common/enums';
import cardStealthSuitEffect from '../card.stealth_suit.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/redis.util';

// Jest 모킹
jest.mock('../../utils/redis.util', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

const mockGetUserFromRoom = getUserFromRoom as jest.MockedFunction<typeof getUserFromRoom>;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.MockedFunction<
	typeof updateCharacterFromRoom
>;

describe('스텔스 장치 카드 효과 테스트', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('1. 기본 장착 로직', () => {
		it('스텔스 장치를 성공적으로 장착해야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';

			const mockUser = {
				id: userId,
				nickname: '테스트유저',
				character: {
					hp: 5,
					equips: [], // 빈 장비 목록
					debuffs: [],
					handCards: [],
					bbangCount: 0,
					handCardsCount: 0,
					characterType: 1,
					roleType: 1,
					weapon: 0,
					stateInfo: {
						state: CharacterStateType.NONE_CHARACTER_STATE,
						nextState: CharacterStateType.NONE_CHARACTER_STATE,
						nextStateAt: '0',
						stateTargetUserId: '0',
					},
				},
			};

			mockGetUserFromRoom.mockResolvedValue(mockUser);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When
			await cardStealthSuitEffect(roomId, userId);

			// Then
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...mockUser.character,
				equips: [CardType.STEALTH_SUIT], // 스텔스 장치가 장착됨
			});
		});

		it('targetUserId는 무시되어야 함 (자신에게만 적용)', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';

			const mockUser = {
				id: userId,
				nickname: '테스트유저',
				character: {
					hp: 5,
					equips: [],
					debuffs: [],
					handCards: [],
					bbangCount: 0,
					handCardsCount: 0,
					characterType: 1,
					roleType: 1,
					weapon: 0,
					stateInfo: {
						state: CharacterStateType.NONE_CHARACTER_STATE,
						nextState: CharacterStateType.NONE_CHARACTER_STATE,
						nextStateAt: '0',
						stateTargetUserId: '0',
					},
				},
			};

			mockGetUserFromRoom.mockResolvedValue(mockUser);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When - targetUserId 없이 호출 (함수 시그니처에 targetUserId가 없음)
			await cardStealthSuitEffect(roomId, userId);

			// Then
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...mockUser.character,
				equips: [CardType.STEALTH_SUIT],
			});
		});
	});

	describe('2. 중복 착용 방지 및 교체 로직', () => {
		it('이미 스텔스 장치를 착용한 경우 첫 번째만 교체해야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';

			const mockUser = {
				id: userId,
				nickname: '테스트유저',
				character: {
					hp: 5,
					equips: [CardType.STEALTH_SUIT, CardType.SHIELD], // 이미 스텔스 장치 착용
					debuffs: [],
					handCards: [],
					bbangCount: 0,
					handCardsCount: 0,
					characterType: 1,
					roleType: 1,
					weapon: 0,
					stateInfo: {
						state: CharacterStateType.NONE_CHARACTER_STATE,
						nextState: CharacterStateType.NONE_CHARACTER_STATE,
						nextStateAt: '0',
						stateTargetUserId: '0',
					},
				},
			};

			mockGetUserFromRoom.mockResolvedValue(mockUser);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When
			await cardStealthSuitEffect(roomId, userId);

			// Then
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...mockUser.character,
				equips: [CardType.SHIELD, CardType.STEALTH_SUIT], // 첫 번째 스텔스 장치 제거 후 새로 추가
			});
		});

		it('여러 개의 스텔스 장치가 있는 경우 첫 번째만 교체해야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';

			const mockUser = {
				id: userId,
				nickname: '테스트유저',
				character: {
					hp: 5,
					equips: [CardType.STEALTH_SUIT, CardType.SHIELD, CardType.STEALTH_SUIT], // 스텔스 장치 2개
					debuffs: [],
					handCards: [],
					bbangCount: 0,
					handCardsCount: 0,
					characterType: 1,
					roleType: 1,
					weapon: 0,
					stateInfo: {
						state: CharacterStateType.NONE_CHARACTER_STATE,
						nextState: CharacterStateType.NONE_CHARACTER_STATE,
						nextStateAt: '0',
						stateTargetUserId: '0',
					},
				},
			};

			mockGetUserFromRoom.mockResolvedValue(mockUser);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When
			await cardStealthSuitEffect(roomId, userId);

			// Then
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...mockUser.character,
				equips: [CardType.SHIELD, CardType.STEALTH_SUIT, CardType.STEALTH_SUIT], // 첫 번째만 제거
			});
		});

		it('스텔스 장치가 없는 경우 새로 장착해야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';

			const mockUser = {
				id: userId,
				nickname: '테스트유저',
				character: {
					hp: 5,
					equips: [CardType.SHIELD, CardType.VACCINE], // 스텔스 장치 없음
					debuffs: [],
					handCards: [],
					bbangCount: 0,
					handCardsCount: 0,
					characterType: 1,
					roleType: 1,
					weapon: 0,
					stateInfo: {
						state: CharacterStateType.NONE_CHARACTER_STATE,
						nextState: CharacterStateType.NONE_CHARACTER_STATE,
						nextStateAt: '0',
						stateTargetUserId: '0',
					},
				},
			};

			mockGetUserFromRoom.mockResolvedValue(mockUser);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When
			await cardStealthSuitEffect(roomId, userId);

			// Then
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...mockUser.character,
				equips: [CardType.SHIELD, CardType.VACCINE, CardType.STEALTH_SUIT], // 새로 추가
			});
		});
	});

	describe('3. 유효성 검증', () => {
		it('사용자를 찾을 수 없으면 아무것도 하지 않아야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'nonexistent_user';

			mockGetUserFromRoom.mockResolvedValue(null);

			// When
			await cardStealthSuitEffect(roomId, userId);

			// Then
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('사용자 캐릭터 정보가 없으면 아무것도 하지 않아야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';

			const mockUser = {
				id: userId,
				nickname: '테스트유저',
				character: undefined, // 캐릭터 정보 없음
			};

			mockGetUserFromRoom.mockResolvedValue(mockUser);

			// When
			await cardStealthSuitEffect(roomId, userId);

			// Then
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('사용자 객체 자체가 없으면 아무것도 하지 않아야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';

			const mockUser = {
				id: userId,
				nickname: '테스트유저',
				// character 속성 자체가 없음
			};

			mockGetUserFromRoom.mockResolvedValue(mockUser);

			// When
			await cardStealthSuitEffect(roomId, userId);

			// Then
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});
	});

	describe('4. 에러 처리', () => {
		it('Redis 업데이트 실패 시 에러를 로깅해야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';

			const mockUser = {
				id: userId,
				nickname: '테스트유저',
				character: {
					hp: 5,
					equips: [],
					debuffs: [],
					handCards: [],
					bbangCount: 0,
					handCardsCount: 0,
					characterType: 1,
					roleType: 1,
					weapon: 0,
					stateInfo: {
						state: CharacterStateType.NONE_CHARACTER_STATE,
						nextState: CharacterStateType.NONE_CHARACTER_STATE,
						nextStateAt: '0',
						stateTargetUserId: '0',
					},
				},
			};

			mockGetUserFromRoom.mockResolvedValue(mockUser);
			mockUpdateCharacterFromRoom.mockRejectedValue(new Error('Redis connection failed'));

			// 콘솔 에러를 모킹하여 에러 로깅 확인
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

			// When
			await cardStealthSuitEffect(roomId, userId);

			// Then
			expect(consoleSpy).toHaveBeenCalledWith(
				'[스텔스 장치] Redis 업데이트 실패:',
				expect.any(Error),
			);

			// 정리
			consoleSpy.mockRestore();
		});

		it('성공 시 로그를 출력해야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';

			const mockUser = {
				id: userId,
				nickname: '테스트유저',
				character: {
					hp: 5,
					equips: [],
					debuffs: [],
					handCards: [],
					bbangCount: 0,
					handCardsCount: 0,
					characterType: 1,
					roleType: 1,
					weapon: 0,
					stateInfo: {
						state: CharacterStateType.NONE_CHARACTER_STATE,
						nextState: CharacterStateType.NONE_CHARACTER_STATE,
						nextStateAt: '0',
						stateTargetUserId: '0',
					},
				},
			};

			mockGetUserFromRoom.mockResolvedValue(mockUser);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// 콘솔 로그를 모킹하여 로그 출력 확인
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

			// When
			await cardStealthSuitEffect(roomId, userId);

			// Then
			expect(consoleSpy).toHaveBeenCalledWith(
				'[스텔스 장치] 테스트유저이 스텔스 장치를 장착했습니다.',
			);

			// 정리
			consoleSpy.mockRestore();
		});
	});

	describe('5. 통합 시나리오 테스트', () => {
		it('복잡한 장비 상황에서도 올바르게 작동해야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';

			const mockUser = {
				id: userId,
				nickname: '테스트유저',
				character: {
					hp: 3,
					equips: [CardType.SHIELD, CardType.STEALTH_SUIT, CardType.VACCINE], // 다양한 장비 착용 (기존 스텔스 장치 포함)
					debuffs: [CardType.SATELLITE_TARGET],
					handCards: [{ type: CardType.BBANG, count: 2 }],
					bbangCount: 1,
					handCardsCount: 2,
					characterType: 2,
					roleType: 3,
					weapon: CardType.HAND_GUN,
					stateInfo: {
						state: CharacterStateType.BBANG_TARGET,
						nextState: CharacterStateType.NONE_CHARACTER_STATE,
						nextStateAt: String(Date.now() + 5000),
						stateTargetUserId: '123',
					},
				},
			};

			mockGetUserFromRoom.mockResolvedValue(mockUser);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When
			await cardStealthSuitEffect(roomId, userId);

			// Then
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...mockUser.character,
				equips: [CardType.SHIELD, CardType.VACCINE, CardType.STEALTH_SUIT], // 기존 스텔스 장치 제거 후 새로 추가
			});
		});
	});
});
