/**
 * 위성타겟 애니메이션 테스트
 *
 * 이 테스트는 위성타겟 카드 효과에서 애니메이션이 올바르게 전송되는지 검증합니다.
 */

// Mock 함수들
const mockGetUserFromRoom = jest.fn();
const mockGetRoom = jest.fn();
const mockUpdateCharacterFromRoom = jest.fn();
const mockSendAnimationNotification = jest.fn();
const mockCheckAndEndGameIfNeeded = jest.fn();

// 모듈 모킹
jest.mock('../utils/room.utils', () => ({
	getUserFromRoom: mockGetUserFromRoom,
	getRoom: mockGetRoom,
	updateCharacterFromRoom: mockUpdateCharacterFromRoom,
}));

jest.mock('../handlers/play.animation.handler', () => ({
	playAnimationHandler: mockSendAnimationNotification,
}));

jest.mock('../utils/game.end.util', () => ({
	checkAndEndGameIfNeeded: mockCheckAndEndGameIfNeeded,
}));

// setTimeout 모킹
const realSetTimeout = global.setTimeout;
global.setTimeout = jest.fn().mockImplementation((cb) => {
	cb();
	return {} as any;
});

import { checkSatelliteTargetEffect } from '../card/debuff/card.satellite_target.effect';
import { AnimationType } from '../generated/common/enums';

describe('위성타겟 애니메이션 테스트', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Math.random을 모킹하여 3% 확률로 효과 발동하도록 설정
		jest.spyOn(Math, 'random').mockReturnValue(0.02); // 3% 미만이므로 효과 발동
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	afterAll(() => {
		global.setTimeout = realSetTimeout;
	});

	it('위성타겟 효과 발동 시 애니메이션을 전송해야 함', async () => {
		// Given
		const roomId = 1;

		const mockRoom = {
			id: roomId,
			users: [
				{
					id: 'player1',
					nickname: 'Player1',
					character: {
						hp: 5,
						debuffs: [22], // SATELLITE_TARGET 디버프
					},
				},
				{
					id: 'player2',
					nickname: 'Player2',
					character: {
						hp: 4,
						debuffs: [],
					},
				},
				{
					id: 'player3',
					nickname: 'Player3',
					character: {
						hp: 3,
						debuffs: [],
					},
				},
			],
			ownerId: 'player1',
			name: 'test room',
			maxUserNum: 8,
			state: 2, // INGAME
		};

		// player1이 위성타겟 디버프를 가지고 있으므로 효과가 발동될 것
		// @ts-expect-error: 테스트를 위한 모킹
		mockGetUserFromRoom.mockImplementation((roomId, userId) => {
			const user = mockRoom.users.find((u) => u.id === userId);
			return user || null;
		});
		mockGetRoom.mockReturnValue(mockRoom);
		mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

		// When
		await checkSatelliteTargetEffect(roomId);

		// Then
		expect(mockGetRoom).toHaveBeenCalledWith(roomId);
		expect(mockSendAnimationNotification).toHaveBeenCalledWith(
			mockRoom.users,
			'player1',
			AnimationType.SATELLITE_TARGET_ANIMATION,
		);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalled();
	}, 10000); // 타임아웃 증가

	it('위성타겟 효과 미발동 시 애니메이션을 전송하지 않아야 함', async () => {
		// Given
		const roomId = 1;

		// Math.random을 3% 이상으로 설정하여 효과 미발동
		jest.spyOn(Math, 'random').mockReturnValue(0.05);

		const mockRoom = {
			id: roomId,
			users: [
				{
					id: 'player1',
					nickname: 'Player1',
					character: {
						hp: 5,
						debuffs: [22], // SATELLITE_TARGET 디버프
					},
				},
				{
					id: 'player2',
					nickname: 'Player2',
					character: {
						hp: 4,
						debuffs: [],
					},
				},
				{
					id: 'player3',
					nickname: 'Player3',
					character: {
						hp: 3,
						debuffs: [],
					},
				},
			],
			ownerId: 'player1',
			name: 'test room',
			maxUserNum: 8,
			state: 2, // INGAME
		};

		// @ts-expect-error: 테스트를 위한 모킹
		mockGetUserFromRoom.mockImplementation((roomId, userId) => {
			const user = mockRoom.users.find((u) => u.id === userId);
			return user || null;
		});
		mockGetRoom.mockReturnValue(mockRoom);
		mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

		// When
		await checkSatelliteTargetEffect(roomId);

		// Then
		expect(mockGetRoom).toHaveBeenCalledWith(roomId);
		expect(mockSendAnimationNotification).not.toHaveBeenCalled();
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalled();
	});

	it('방을 찾을 수 없으면 아무것도 하지 않아야 함', async () => {
		// Given
		const roomId = 1;

		mockGetRoom.mockResolvedValue(null);

		// When
		const result = await checkSatelliteTargetEffect(roomId);

		// Then
		expect(mockGetRoom).toHaveBeenCalledWith(roomId);
		expect(mockGetUserFromRoom).not.toHaveBeenCalled();
		expect(mockSendAnimationNotification).not.toHaveBeenCalled();
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		expect(result).toBeNull();
	});
});
