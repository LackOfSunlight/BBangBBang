import cardHandGunEffect from '../weapon/card.hand_gun.effect';
import * as roomUtils from '../../Utils/room.utils';
import { CharacterType, RoleType } from '../../Generated/common/enums';

// 모킹 설정
jest.mock('../../utils/room.utils');

// 모킹 함수 생성
const mockGetRoom = jest.spyOn(roomUtils, 'getRoom');
const mockUpdateCharacterFromRoom = jest.spyOn(roomUtils, 'updateCharacterFromRoom');

// 에러 로그 출력 억제
beforeAll(() => {
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
	jest.restoreAllMocks();
});

describe('cardHandGunEffect', () => {
	const roomId = 1;
	const userId = 'user1';
	const targetUserId = 'user2';

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('유효성 검증', () => {
		it('방이 없으면 함수가 종료된다', async () => {
			mockGetRoom.mockImplementation(() => {
				throw new Error('Room not found');
			});

			const result = await cardHandGunEffect(roomId, userId);

			expect(mockGetRoom).toHaveBeenCalledWith(roomId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('사용자가 없으면 함수가 종료된다', async () => {
			const mockRoom = {
				id: roomId,
				users: [{ id: 'otherUser', nickname: 'other' }], // 다른 유저만 있음
				ownerId: 'user1',
				name: 'test room',
				maxUserNum: 8,
				state: 2, // INGAME
			};
			mockGetRoom.mockReturnValue(mockRoom);

			const result = await cardHandGunEffect(roomId, userId);

			expect(mockGetRoom).toHaveBeenCalledWith(roomId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('사용자의 캐릭터가 없으면 함수가 종료된다', async () => {
			const mockRoom = {
				id: roomId,
				users: [{ id: userId, nickname: 'testUser' }], // 캐릭터 없음
				ownerId: 'user1',
				name: 'test room',
				maxUserNum: 8,
				state: 2, // INGAME
			};
			mockGetRoom.mockReturnValue(mockRoom);

			const result = await cardHandGunEffect(roomId, userId);

			expect(mockGetRoom).toHaveBeenCalledWith(roomId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
			expect(result).toBe(false);
		});
	});

	describe('핸드건 효과 로직', () => {
		const createMockCharacter = () => ({
			characterType: CharacterType.RED,
			roleType: RoleType.TARGET,
			hp: 3,
			weapon: 0,
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 1,
			handCardsCount: 0,
		});

		it('자신의 무기를 14로 설정한다 (targetUserId 무시)', async () => {
			const mockCharacter = createMockCharacter();
			const mockRoom = {
				id: roomId,
				users: [
					{
						id: userId,
						nickname: 'user1',
						character: mockCharacter,
					},
				],
				ownerId: 'user1',
				name: 'test room',
				maxUserNum: 8,
				state: 2, // INGAME
			};

			mockGetRoom.mockReturnValue(mockRoom);

			const result = await cardHandGunEffect(roomId, userId);

			expect(mockGetRoom).toHaveBeenCalledWith(roomId);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...mockCharacter,
				weapon: 14, // 핸드건 무기로 설정
			});
			expect(result).toBe(true);
		});

		it('정상적으로 핸드건 효과가 적용된다', async () => {
			const mockCharacter = createMockCharacter();
			const mockRoom = {
				id: roomId,
				users: [
					{
						id: userId,
						nickname: 'user1',
						character: mockCharacter,
					},
				],
				ownerId: 'user1',
				name: 'test room',
				maxUserNum: 8,
				state: 2, // INGAME
			};

			mockGetRoom.mockReturnValue(mockRoom);

			const result = await cardHandGunEffect(roomId, userId);

			expect(result).toBe(true);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...mockCharacter,
				weapon: 14,
			});
		});
	});

	describe('에러 처리', () => {
		it('방을 찾을 수 없으면 에러가 처리된다', async () => {
			mockGetRoom.mockImplementation(() => {
				throw new Error('Room not found');
			});

			const result = await cardHandGunEffect(roomId, userId);

			expect(result).toBe(false);
		});

		it('updateCharacterFromRoom에서 에러가 발생해도 함수가 정상적으로 처리된다', async () => {
			const mockCharacter = {
				characterType: CharacterType.RED,
				roleType: RoleType.TARGET,
				hp: 3,
				weapon: 0,
				equips: [],
				debuffs: [],
				handCards: [],
				bbangCount: 1,
				handCardsCount: 0,
			};

			const mockRoom = {
				id: roomId,
				users: [
					{
						id: userId,
						nickname: 'user1',
						character: mockCharacter,
					},
				],
				ownerId: 'user1',
				name: 'test room',
				maxUserNum: 8,
				state: 2, // INGAME
			};

			mockGetRoom.mockReturnValue(mockRoom);
			mockUpdateCharacterFromRoom.mockImplementation(() => {
				throw new Error('Update error');
			});

			const result = await cardHandGunEffect(roomId, userId);

			expect(result).toBe(false);
		});
	});
});
