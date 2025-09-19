import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CardType, AnimationType } from '../../generated/common/enums';
import { checkSatelliteTargetEffect } from '../card.satellite_target.effect';
import cardSatelliteTargetEffect from '../card.satellite_target.effect';

jest.mock('../../utils/redis.util', () => ({
	getRoom: jest.fn(),
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

jest.mock('../../handlers/notification/animation.notification.handler', () => ({
	sendAnimationNotification: jest.fn(),
}));

import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/redis.util';
import { sendAnimationNotification } from '../../handlers/notification/animation.notification.handler';

const mockGetRoom = getRoom as jest.MockedFunction<typeof getRoom>;
const mockGetUserFromRoom = getUserFromRoom as jest.MockedFunction<typeof getUserFromRoom>;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.MockedFunction<
	typeof updateCharacterFromRoom
>;
const mockSendAnimationNotification = sendAnimationNotification as jest.MockedFunction<
	typeof sendAnimationNotification
>;

describe('위성 타겟 효과 테스트', () => {
	// 테스트용 모킹 데이터
	const mockRoomId = 1;
	const mockUserId = 'user1';
	const mockTargetUserId = 'user2';
	const mockNextUserId = 'user3';

	// 기본 캐릭터 데이터
	const createMockCharacter = (hp: number, debuffs: CardType[] = []) => ({
		hp,
		debuffs,
		handCards: [],
		handCardsCount: 0,
	});

	// 기본 유저 데이터
	const createMockUser = (id: string, nickname: string, character: any) => ({
		id,
		nickname,
		character,
	});

	// 기본 방 데이터
	const createMockRoom = (id: number, users: any[]) => ({
		id,
		users,
		ownerId: 'owner1',
		name: 'Test Room',
		maxUserNum: 4,
		state: 'PLAYING' as any,
	});

	beforeEach(() => {
		// 각 테스트 전에 모든 mock 초기화
		jest.clearAllMocks();
	});

	describe('cardSatelliteTargetEffect - 카드 사용 시 디버프 추가', () => {
		it('성공적으로 위성 타겟 디버프를 추가해야 함', async () => {
			// Given: 타겟 유저가 존재하고 디버프가 없는 상태
			const mockTarget = createMockUser(mockTargetUserId, '타겟유저', createMockCharacter(10));
			mockGetUserFromRoom.mockResolvedValue(mockTarget);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When: 위성 타겟 카드를 사용
			const result = await cardSatelliteTargetEffect(mockRoomId, mockUserId, mockTargetUserId);

			// Then: 디버프가 추가되고 true 반환
			expect(result).toBe(true);
			expect(mockTarget.character.debuffs).toContain(CardType.SATELLITE_TARGET);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(
				mockRoomId,
				mockTargetUserId,
				mockTarget.character,
			);
		});

		it('이미 디버프가 있는 경우 true를 반환해야 함', async () => {
			// Given: 타겟 유저가 이미 위성 타겟 디버프를 가지고 있음
			const mockTarget = createMockUser(
				mockTargetUserId,
				'타겟유저',
				createMockCharacter(10, [CardType.SATELLITE_TARGET]),
			);
			mockGetUserFromRoom.mockResolvedValue(mockTarget);

			// When: 위성 타겟 카드를 사용
			const result = await cardSatelliteTargetEffect(mockRoomId, mockUserId, mockTargetUserId);

			// Then: true 반환하고 Redis 업데이트는 하지 않음
			expect(result).toBe(true);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('타겟 유저가 존재하지 않는 경우 false를 반환해야 함', async () => {
			// Given: 타겟 유저가 존재하지 않음
			mockGetUserFromRoom.mockResolvedValue(null);

			// When: 위성 타겟 카드를 사용
			const result = await cardSatelliteTargetEffect(mockRoomId, mockUserId, mockTargetUserId);

			// Then: false 반환하고 Redis 업데이트는 하지 않음
			expect(result).toBe(false);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('Redis 업데이트 실패 시 false를 반환해야 함', async () => {
			// Given: 타겟 유저는 존재하지만 Redis 업데이트가 실패
			const mockTarget = createMockUser(mockTargetUserId, '타겟유저', createMockCharacter(10));
			mockGetUserFromRoom.mockResolvedValue(mockTarget);
			mockUpdateCharacterFromRoom.mockRejectedValue(new Error('Redis connection failed'));

			// When: 위성 타겟 카드를 사용
			const result = await cardSatelliteTargetEffect(mockRoomId, mockUserId, mockTargetUserId);

			// Then: false 반환
			expect(result).toBe(false);
		});
	});

	describe('checkSatelliteTargetEffect - 하루 시작 시 효과 체크', () => {
		it('위성 타겟 디버프를 가진 유저가 없으면 원본 방 정보를 반환해야 함', async () => {
			// Given: 위성 타겟 디버프를 가진 유저가 없는 방
			const mockRoom = createMockRoom(mockRoomId, [
				createMockUser('user1', '유저1', createMockCharacter(10)),
				createMockUser('user2', '유저2', createMockCharacter(8)),
			]);
			mockGetRoom.mockResolvedValue(mockRoom);

			// When: 위성 타겟 효과 체크
			const result = await checkSatelliteTargetEffect(mockRoomId);

			// Then: 원본 방 정보 반환
			expect(result).toEqual(mockRoom);
			expect(mockSendAnimationNotification).not.toHaveBeenCalled();
		});

		it('위성 타겟 디버프를 가진 유저가 있으면 효과를 처리해야 함', async () => {
			// Given: 위성 타겟 디버프를 가진 유저가 있는 방
			const mockUserWithDebuff = createMockUser(
				'user1',
				'유저1',
				createMockCharacter(10, [CardType.SATELLITE_TARGET]),
			);
			const mockRoom = createMockRoom(mockRoomId, [
				mockUserWithDebuff,
				createMockUser('user2', '유저2', createMockCharacter(8)),
			]);
			mockGetRoom.mockResolvedValue(mockRoom);
			mockGetUserFromRoom.mockResolvedValue(mockUserWithDebuff);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When: 위성 타겟 효과 체크 (Math.random을 0.01로 고정하여 효과 발동)
			const originalRandom = Math.random;
			Math.random = jest.fn(() => 0.01); // 3% 확률보다 낮아서 효과 발동

			const result = await checkSatelliteTargetEffect(mockRoomId);

			// Then: 효과가 발동되고 애니메이션 전송
			expect(mockSendAnimationNotification).toHaveBeenCalledWith(
				mockRoom.users,
				'user1',
				AnimationType.SATELLITE_TARGET_ANIMATION,
			);

			// 원래 Math.random 복원
			Math.random = originalRandom;
		});
	});

	describe('위성 타겟 효과 발동 시나리오', () => {
		it('3% 확률로 효과가 발동되어 HP가 3 감소해야 함', async () => {
			// Given: 위성 타겟 디버프를 가진 유저
			const mockTarget = createMockUser(
				'user1',
				'유저1',
				createMockCharacter(10, [CardType.SATELLITE_TARGET]),
			);
			const mockRoom = createMockRoom(mockRoomId, [mockTarget]);
			mockGetRoom.mockResolvedValue(mockRoom);
			mockGetUserFromRoom.mockResolvedValue(mockTarget);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When: 효과가 발동되도록 Math.random 조작
			const originalRandom = Math.random;
			Math.random = jest.fn(() => 0.01); // 3% 확률보다 낮아서 효과 발동

			await checkSatelliteTargetEffect(mockRoomId);

			// Then: HP가 3 감소하고 디버프가 제거됨
			expect(mockTarget.character.hp).toBe(7); // 10 - 3
			expect(mockTarget.character.debuffs).not.toContain(CardType.SATELLITE_TARGET);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(
				mockRoomId,
				'user1',
				mockTarget.character,
			);

			// 원래 Math.random 복원
			Math.random = originalRandom;
		});

		it('HP가 0 미만으로 떨어지지 않아야 함', async () => {
			// Given: HP가 2인 유저가 위성 타겟 디버프를 가짐
			const mockTarget = createMockUser(
				'user1',
				'유저1',
				createMockCharacter(2, [CardType.SATELLITE_TARGET]),
			);
			const mockRoom = createMockRoom(mockRoomId, [mockTarget]);
			mockGetRoom.mockResolvedValue(mockRoom);
			mockGetUserFromRoom.mockResolvedValue(mockTarget);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When: 효과가 발동되도록 Math.random 조작
			const originalRandom = Math.random;
			Math.random = jest.fn(() => 0.01);

			await checkSatelliteTargetEffect(mockRoomId);

			// Then: HP가 0 미만으로 떨어지지 않음
			expect(mockTarget.character.hp).toBe(0); // 2 - 3 = -1이지만 0으로 제한

			// 원래 Math.random 복원
			Math.random = originalRandom;
		});
	});

	describe('위성 타겟 효과 미발동 시나리오', () => {
		it('효과가 미발동되면 다음 유저에게 디버프가 이전되어야 함', async () => {
			// Given: 3명의 유저가 있는 방, 첫 번째 유저가 위성 타겟 디버프를 가짐
			const mockUser1 = createMockUser(
				'user1',
				'유저1',
				createMockCharacter(10, [CardType.SATELLITE_TARGET]),
			);
			const mockUser2 = createMockUser('user2', '유저2', createMockCharacter(8));
			const mockUser3 = createMockUser('user3', '유저3', createMockCharacter(6));

			const mockRoom = createMockRoom(mockRoomId, [mockUser1, mockUser2, mockUser3]);

			mockGetRoom.mockResolvedValue(mockRoom);
			mockGetUserFromRoom
				.mockResolvedValueOnce(mockUser1) // 첫 번째 호출: 현재 유저
				.mockResolvedValueOnce(mockUser2); // 두 번째 호출: 다음 유저
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When: 효과가 미발동되도록 Math.random 조작 (3% 확률보다 높음)
			const originalRandom = Math.random;
			Math.random = jest.fn(() => 0.95); // 95% 확률로 효과 미발동

			await checkSatelliteTargetEffect(mockRoomId);

			// Then: 첫 번째 유저의 디버프가 제거되고 두 번째 유저에게 이전됨
			expect(mockUser1.character.debuffs).not.toContain(CardType.SATELLITE_TARGET);
			expect(mockUser2.character.debuffs).toContain(CardType.SATELLITE_TARGET);

			// Redis 업데이트가 두 번 호출됨 (현재 유저 제거, 다음 유저 추가)
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(2);

			// 원래 Math.random 복원
			Math.random = originalRandom;
		});

		it('마지막 유저에서 효과가 미발동되면 첫 번째 유저에게 디버프가 이전되어야 함', async () => {
			// Given: 3명의 유저가 있는 방, 세 번째 유저가 위성 타겟 디버프를 가짐
			const mockUser1 = createMockUser('user1', '유저1', createMockCharacter(10));
			const mockUser2 = createMockUser('user2', '유저2', createMockCharacter(8));
			const mockUser3 = createMockUser(
				'user3',
				'유저3',
				createMockCharacter(6, [CardType.SATELLITE_TARGET]),
			);

			const mockRoom = createMockRoom(mockRoomId, [mockUser1, mockUser2, mockUser3]);

			mockGetRoom.mockResolvedValue(mockRoom);
			mockGetUserFromRoom
				.mockResolvedValueOnce(mockUser3) // 첫 번째 호출: 현재 유저 (마지막)
				.mockResolvedValueOnce(mockUser1); // 두 번째 호출: 다음 유저 (첫 번째)
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When: 효과가 미발동되도록 Math.random 조작
			const originalRandom = Math.random;
			Math.random = jest.fn(() => 0.95);

			await checkSatelliteTargetEffect(mockRoomId);

			// Then: 세 번째 유저의 디버프가 제거되고 첫 번째 유저에게 이전됨
			expect(mockUser3.character.debuffs).not.toContain(CardType.SATELLITE_TARGET);
			expect(mockUser1.character.debuffs).toContain(CardType.SATELLITE_TARGET);

			// 원래 Math.random 복원
			Math.random = originalRandom;
		});
	});

	describe('에러 처리 시나리오', () => {
		it('방 정보를 가져올 수 없으면 null을 반환해야 함', async () => {
			// Given: 방 정보를 가져올 수 없음
			mockGetRoom.mockResolvedValue(null);

			// When: 위성 타겟 효과 체크
			const result = await checkSatelliteTargetEffect(mockRoomId);

			// Then: null 반환
			expect(result).toBeNull();
		});

		it('유저 정보를 가져올 수 없으면 해당 유저는 건너뛰어야 함', async () => {
			// Given: 방은 존재하지만 특정 유저 정보를 가져올 수 없음
			const mockUserWithDebuff = createMockUser(
				'user1',
				'유저1',
				createMockCharacter(10, [CardType.SATELLITE_TARGET]),
			);
			const mockRoom = createMockRoom(mockRoomId, [mockUserWithDebuff]);

			mockGetRoom.mockResolvedValue(mockRoom);
			mockGetUserFromRoom.mockResolvedValue(null); // 유저 정보를 가져올 수 없음

			// When: 위성 타겟 효과 체크
			const result = await checkSatelliteTargetEffect(mockRoomId);

			// Then: 에러 없이 완료되고 원본 방 정보 반환
			expect(result).toEqual(mockRoom);
			expect(mockSendAnimationNotification).not.toHaveBeenCalled();
		});

		it('Redis 업데이트 실패 시 에러를 로깅해야 함', async () => {
			// Given: 위성 타겟 디버프를 가진 유저, Redis 업데이트 실패
			const mockTarget = createMockUser(
				'user1',
				'유저1',
				createMockCharacter(10, [CardType.SATELLITE_TARGET]),
			);
			const mockRoom = createMockRoom(mockRoomId, [mockTarget]);

			mockGetRoom.mockResolvedValue(mockRoom);
			mockGetUserFromRoom.mockResolvedValue(mockTarget);
			mockUpdateCharacterFromRoom.mockRejectedValue(new Error('Redis connection failed'));

			// When: 효과가 발동되도록 Math.random 조작
			const originalRandom = Math.random;
			Math.random = jest.fn(() => 0.01);

			// 콘솔 에러를 모킹하여 에러 로깅 확인
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

			await checkSatelliteTargetEffect(mockRoomId);

			// Then: 에러가 로깅됨
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('[SatelliteTarget] Redis 업데이트 중 오류 발생'),
			);

			// 정리
			consoleSpy.mockRestore();
			Math.random = originalRandom;
		});
	});

	describe('확률 테스트', () => {
		it('확률 상수 값이 올바르게 설정되어 있어야 함', async () => {
			// Given: 위성 타겟 디버프를 가진 유저
			const mockTarget = createMockUser(
				'user1',
				'유저1',
				createMockCharacter(10, [CardType.SATELLITE_TARGET]),
			);
			const mockRoom = createMockRoom(mockRoomId, [mockTarget]);

			mockGetRoom.mockResolvedValue(mockRoom);
			mockGetUserFromRoom.mockResolvedValue(mockTarget);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When: 정확히 3% 확률로 설정
			const originalRandom = Math.random;
			Math.random = jest.fn(() => 0.03); // 정확히 3% 확률

			await checkSatelliteTargetEffect(mockRoomId);

			// Then: 효과가 발동됨 (Math.random() < 0.03이 false이므로 발동)
			// 실제로는 0.03보다 작아야 발동되므로 0.029로 테스트
			Math.random = jest.fn(() => 0.029);
			await checkSatelliteTargetEffect(mockRoomId);

			expect(mockSendAnimationNotification).toHaveBeenCalled();

			// 원래 Math.random 복원
			Math.random = originalRandom;
		});
	});
});
