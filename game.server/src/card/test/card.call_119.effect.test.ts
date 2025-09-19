import cardCall119Effect from '../card.call_119.effect';
import { getRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { CharacterType, RoleType } from '../../generated/common/enums';

// Mock 설정
jest.mock('../../utils/room.utils', () => ({
	getRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

const mockGetRoom = getRoom as jest.MockedFunction<typeof getRoom>;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.MockedFunction<
	typeof updateCharacterFromRoom
>;

describe('cardCall119Effect', () => {
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

			const result = await cardCall119Effect(roomId, userId, targetUserId);

			expect(mockGetRoom).toHaveBeenCalledWith(roomId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('사용자가 없으면 함수가 종료된다', async () => {
			const mockRoom = {
				id: roomId,
				users: [{ id: 'otherUser', nickname: 'other' }], // 다른 유저만 있음
			};
			mockGetRoom.mockReturnValue(mockRoom);

			const result = await cardCall119Effect(roomId, userId, targetUserId);

			expect(mockGetRoom).toHaveBeenCalledWith(roomId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it('사용자의 캐릭터가 없으면 함수가 종료된다', async () => {
			const mockRoom = {
				id: roomId,
				users: [{ id: userId, nickname: 'testUser' }], // 캐릭터 없음
			};
			mockGetRoom.mockReturnValue(mockRoom);

			const result = await cardCall119Effect(roomId, userId, targetUserId);

			expect(mockGetRoom).toHaveBeenCalledWith(roomId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
			expect(result).toBe(false);
		});
	});

	describe('체력 회복 로직', () => {
		const createMockCharacter = (characterType: CharacterType, hp: number) => ({
			characterType,
			roleType: RoleType.TARGET,
			hp,
			weapon: 0,
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		it('자신의 체력을 1 회복한다 (targetUserId가 있는 경우)', async () => {
			const mockCharacter = createMockCharacter(CharacterType.RED, 2);
			const mockRoom = {
				id: roomId,
				users: [{
					id: userId,
					nickname: 'user1',
					character: mockCharacter,
				}],
			};

			mockGetRoom.mockReturnValue(mockRoom);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			const result = await cardCall119Effect(roomId, userId, 'self'); // targetUserId가 있으면 자신 회복

			expect(result).toBe(true);
			expect(mockGetRoom).toHaveBeenCalledWith(roomId);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...mockCharacter,
				hp: 3,
			});
			expect(consoleSpy).toHaveBeenCalledWith(
				'[119 호출] user1의 체력이 2 → 3로 회복되었습니다. (최대: 4)',
			);

			consoleSpy.mockRestore();
		});

		it('나머지 플레이어들의 체력을 1 회복한다 (targetUserId가 없는 경우)', async () => {
			const userCharacter = createMockCharacter(CharacterType.RED, 4);
			const user2Character = createMockCharacter(CharacterType.SHARK, 2);
			const user3Character = createMockCharacter(CharacterType.DINOSAUR, 1);
			
			const mockRoom = {
				id: roomId,
				users: [
					{
						id: userId,
						nickname: 'user1',
						character: userCharacter,
					},
					{
						id: 'user2',
						nickname: 'user2',
						character: user2Character,
					},
					{
						id: 'user3',
						nickname: 'user3',
						character: user3Character,
					},
				],
			};

			mockGetRoom.mockReturnValue(mockRoom);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			const result = await cardCall119Effect(roomId, userId, '0'); // targetUserId가 "0"이면 나머지 회복

			expect(result).toBe(true);
			expect(mockGetRoom).toHaveBeenCalledWith(roomId);
			
			// user2와 user3의 체력이 회복되어야 함 (user1은 제외)
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(2);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, 'user2', {
				...user2Character,
				hp: 3,
			});
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, 'user3', {
				...user3Character,
				hp: 2,
			});

			consoleSpy.mockRestore();
		});

		it('최대 체력에 도달한 경우 회복하지 않는다', async () => {
			const mockCharacter = createMockCharacter(CharacterType.RED, 4); // 최대 체력
			const mockRoom = {
				id: roomId,
				users: [{
					id: userId,
					nickname: 'user1',
					character: mockCharacter,
				}],
			};

			mockGetRoom.mockReturnValue(mockRoom);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			const result = await cardCall119Effect(roomId, userId, 'self'); // 자신 회복

			expect(result).toBe(true);
			expect(consoleSpy).toHaveBeenCalledWith('[119 호출] user1의 체력이 이미 최대치(4)입니다.');
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it('공룡이 캐릭터의 최대 체력(3)을 초과하지 않는다', async () => {
			const mockCharacter = createMockCharacter(CharacterType.DINOSAUR, 2);
			const mockRoom = {
				id: roomId,
				users: [{
					id: userId,
					nickname: 'user1',
					character: mockCharacter,
				}],
			};

			mockGetRoom.mockReturnValue(mockRoom);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			const result = await cardCall119Effect(roomId, userId, 'self'); // 자신 회복

			expect(result).toBe(true);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...mockCharacter,
				hp: 3, // 최대 체력 3에 제한됨
			});
			expect(consoleSpy).toHaveBeenCalledWith(
				'[119 호출] user1의 체력이 2 → 3로 회복되었습니다. (최대: 3)',
			);

			consoleSpy.mockRestore();
		});

		it('핑크슬라임 캐릭터의 최대 체력(3)을 초과하지 않는다', async () => {
			const mockCharacter = createMockCharacter(CharacterType.PINK_SLIME, 2);
			const mockRoom = {
				id: roomId,
				users: [{
					id: userId,
					nickname: 'user1',
					character: mockCharacter,
				}],
			};

			mockGetRoom.mockReturnValue(mockRoom);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			const result = await cardCall119Effect(roomId, userId, 'self'); // 자신 회복

			expect(result).toBe(true);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...mockCharacter,
				hp: 3, // 최대 체력 3에 제한됨
			});
			expect(consoleSpy).toHaveBeenCalledWith(
				'[119 호출] user1의 체력이 2 → 3로 회복되었습니다. (최대: 3)',
			);

			consoleSpy.mockRestore();
		});
	});

	describe('에러 처리', () => {
		it('방을 찾을 수 없으면 에러가 처리된다', async () => {
			mockGetRoom.mockImplementation(() => {
				throw new Error('Room not found');
			});

			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

			const result = await cardCall119Effect(roomId, userId, 'self');

			expect(result).toBe(false);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[119 호출] 방 또는 유저를 찾을 수 없음:',
				expect.any(Error),
			);

			consoleErrorSpy.mockRestore();
		});

		it('updateCharacterFromRoom에서 에러가 발생해도 함수가 정상적으로 처리된다', async () => {
			const mockCharacter = {
				characterType: CharacterType.RED,
				roleType: RoleType.TARGET,
				hp: 2,
				weapon: 0,
				equips: [],
				debuffs: [],
				handCards: [],
				bbangCount: 0,
				handCardsCount: 0,
			};

			const mockRoom = {
				id: roomId,
				users: [{
					id: userId,
					nickname: 'user1',
					character: mockCharacter,
				}],
			};

			mockGetRoom.mockReturnValue(mockRoom);
			mockUpdateCharacterFromRoom.mockImplementation(() => {
				throw new Error('Update error');
			});

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

			// 에러가 발생해도 함수가 정상적으로 처리되는지 확인
			const result = await cardCall119Effect(roomId, userId, 'self');

			expect(result).toBe(true);
			// 에러 로그가 출력되는지 확인
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[119 호출] 방 업데이트 실패:',
				expect.any(Error),
			);

			consoleSpy.mockRestore();
			consoleErrorSpy.mockRestore();
		});
	});
});
