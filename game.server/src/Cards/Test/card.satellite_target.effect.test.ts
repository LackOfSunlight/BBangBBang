import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { CardType, AnimationType } from '../../generated/common/enums';
import { checkSatelliteTargetEffect } from '../Debuff/card.satellite_target.effect';
import cardSatelliteTargetEffect from '../Debuff/card.satellite_target.effect';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../Utils/room.utils';
import { playAnimationHandler } from '../../Handlers/play.animation.handler';
import { checkAndEndGameIfNeeded } from '../../Services/game.end.service';
import { cardManager } from '../../Managers/card.manager';

// Mocks
jest.mock('../../utils/room.utils', () => ({
	getRoom: jest.fn(),
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

jest.mock('../../handlers/play.animation.handler', () => ({
	playAnimationHandler: jest.fn(),
}));

jest.mock('../../utils/game.end.util', () => ({
	checkAndEndGameIfNeeded: jest.fn(),
}));

jest.mock('../../managers/card.manager');

const mockGetRoom = getRoom as jest.MockedFunction<typeof getRoom>;
const mockGetUserFromRoom = getUserFromRoom as jest.MockedFunction<typeof getUserFromRoom>;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.MockedFunction<
	typeof updateCharacterFromRoom
>;
const mockPlayAnimationHandler = playAnimationHandler as jest.MockedFunction<
	typeof playAnimationHandler
>;
const mockCheckAndEndGameIfNeeded = checkAndEndGameIfNeeded as jest.MockedFunction<
	typeof checkAndEndGameIfNeeded
>;

describe('위성 타겟 효과 테스트', () => {
	const mockRoomId = 1;
	const mockUserId = 'user1';
	const mockTargetUserId = 'user2';

	const createMockCharacter = (hp: number, debuffs: CardType[] = []) => ({
		hp,
		debuffs,
		handCards: [],
		handCardsCount: 0,
		id: 'char1',
		position: { x: 0, y: 0, z: 0 },
		rotation: { x: 0, y: 0, z: 0 },
		state: 0,
		type: 0,
		buffs: [],
		equipCards: [],
	});

	const createMockUser = (id: string, nickname: string, character: any) => ({
		id,
		nickname,
		character,
		socket: {} as any,
	});

	const createMockRoom = (id: number, users: any[]) => ({
		id,
		users,
		ownerId: 'owner1',
		name: 'Test Room',
		maxUserNum: 4,
		state: 'PLAYING' as any,
		cardManager: {} as any,
		gameManager: {} as any,
	});

	beforeEach(() => {
		jest.clearAllMocks();
		mockCheckAndEndGameIfNeeded.mockResolvedValue(undefined);
		mockUpdateCharacterFromRoom.mockImplementation(() => {});
	});

	describe('cardSatelliteTargetEffect - 카드 사용 시 디버프 추가', () => {
		it('성공적으로 위성 타겟 디버프를 추가해야 함', () => {
			const mockTarget = createMockUser(mockTargetUserId, '타겟유저', createMockCharacter(10));
			mockGetUserFromRoom.mockReturnValue(mockTarget as any);

			const result = cardSatelliteTargetEffect(mockRoomId, mockUserId, mockTargetUserId);

			expect(result).toBe(true);
			expect(cardManager.removeCard).toHaveBeenCalledTimes(1);
			expect(mockTarget.character.debuffs).toContain(CardType.SATELLITE_TARGET);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(
				mockRoomId,
				mockTargetUserId,
				mockTarget.character,
			);
		});

		it('이미 디버프가 있는 경우 true를 반환해야 함', () => {
			const mockTarget = createMockUser(
				mockTargetUserId,
				'타겟유저',
				createMockCharacter(10, [CardType.SATELLITE_TARGET]),
			);
			mockGetUserFromRoom.mockReturnValue(mockTarget as any);

			const result = cardSatelliteTargetEffect(mockRoomId, mockUserId, mockTargetUserId);

			expect(result).toBe(true);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('타겟 유저를 찾지 못하면 false를 반환해야 함', () => {
			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
			const notFoundError = new Error('User not found');
			mockGetUserFromRoom.mockImplementation(() => {
				throw notFoundError;
			});

			const result = cardSatelliteTargetEffect(mockRoomId, mockUserId, mockTargetUserId);

			expect(result).toBe(false);
			expect(cardManager.removeCard).toHaveBeenCalledTimes(0);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				`[SatelliteTarget] 위성 타겟 적용 중 오류 발생: ${notFoundError}`,
			);
			consoleErrorSpy.mockRestore();
		});

		it('캐릭터 정보가 없는 경우 false를 반환해야 함', () => {
			const mockTarget = createMockUser(mockTargetUserId, '타겟유저', null);
			mockGetUserFromRoom.mockReturnValue(mockTarget as any);

			const result = cardSatelliteTargetEffect(mockRoomId, mockUserId, mockTargetUserId);

			expect(result).toBe(false);
			expect(cardManager.removeCard).toHaveBeenCalledTimes(0);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('updateCharacterFromRoom 실패 시 false를 반환해야 함', () => {
			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
			const updateError = new Error('Update failed');
			const mockTarget = createMockUser(mockTargetUserId, '타겟유저', createMockCharacter(10));
			mockGetUserFromRoom.mockReturnValue(mockTarget as any);
			mockUpdateCharacterFromRoom.mockImplementation(() => {
				throw updateError;
			});

			const result = cardSatelliteTargetEffect(mockRoomId, mockUserId, mockTargetUserId);

			expect(result).toBe(false);
			expect(cardManager.removeCard).toHaveBeenCalledTimes(1);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				`[SatelliteTarget] 위성 타겟 적용 중 오류 발생: ${updateError}`,
			);
			consoleErrorSpy.mockRestore();
		});
	});

	describe('checkSatelliteTargetEffect - 하루 시작 시 효과 체크', () => {
		afterEach(() => {
			jest.useRealTimers();
		});

		it('방을 찾지 못하면 null을 반환해야 함', async () => {
			mockGetRoom.mockImplementation(() => {
				throw new Error('Room not found');
			});

			const result = await checkSatelliteTargetEffect(mockRoomId);

			expect(result).toBeNull();
		});

		it('위성 타겟 디버프를 가진 유저가 없으면 방 정보를 그대로 반환해야 함', async () => {
			const mockRoom = createMockRoom(mockRoomId, [
				createMockUser('user1', '유저1', createMockCharacter(10)),
			]);
			mockGetRoom.mockReturnValue(mockRoom as any);

			const result = await checkSatelliteTargetEffect(mockRoomId);

			expect(result).toEqual(mockRoom);
			expect(mockPlayAnimationHandler).not.toHaveBeenCalled();
		});
	});

	describe('processSatelliteTargetEffect - 개별 유저 효과 처리', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
			jest.restoreAllMocks();
		});

		it('3% 확률로 효과가 발동되어 HP가 3 감소해야 함', async () => {
			const mockTarget = createMockUser(
				'user1',
				'유저1',
				createMockCharacter(10, [CardType.SATELLITE_TARGET]),
			);
			const mockRoom = createMockRoom(mockRoomId, [mockTarget]);
			mockGetRoom.mockReturnValue(mockRoom as any);
			mockGetUserFromRoom.mockReturnValue(mockTarget as any);

			const originalRandom = Math.random;
			Math.random = jest.fn(() => 0.01);

			const promise = checkSatelliteTargetEffect(mockRoomId);
			await jest.advanceTimersByTimeAsync(2000);
			await promise;

			expect(mockTarget.character.hp).toBe(7);
			expect(mockTarget.character.debuffs).not.toContain(CardType.SATELLITE_TARGET);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(
				mockRoomId,
				'user1',
				mockTarget.character,
			);
			expect(mockCheckAndEndGameIfNeeded).toHaveBeenCalledWith(mockRoomId);

			Math.random = originalRandom;
		});

		it('효과 미발동 시 다음 유저에게 디버프가 이전되어야 함', async () => {
			const mockUser1 = createMockUser(
				'user1',
				'유저1',
				createMockCharacter(10, [CardType.SATELLITE_TARGET]),
			);
			const mockUser2 = createMockUser('user2', '유저2', createMockCharacter(8));
			const mockRoom = createMockRoom(mockRoomId, [mockUser1, mockUser2]);

			mockGetRoom.mockReturnValue(mockRoom as any);
			mockGetUserFromRoom
				.mockReturnValueOnce(mockUser1 as any)
				.mockReturnValueOnce(mockUser2 as any);

			const originalRandom = Math.random;
			Math.random = jest.fn(() => 0.95);

			await checkSatelliteTargetEffect(mockRoomId);

			expect(mockUser1.character.debuffs).not.toContain(CardType.SATELLITE_TARGET);
			expect(mockUser2.character.debuffs).toContain(CardType.SATELLITE_TARGET);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(2);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(
				mockRoomId,
				'user1',
				mockUser1.character,
			);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(
				mockRoomId,
				'user2',
				mockUser2.character,
			);

			Math.random = originalRandom;
		});
	});
});
