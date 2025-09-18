import cardCall119Effect from '../card.call_119.effect';
import { getUserFromRoom, updateCharacterFromRoom, getRoom } from '../../utils/redis.util';
import { CharacterType, RoleType } from '../../generated/common/enums';

// Mock 설정
jest.mock('../../utils/redis.util', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
	getRoom: jest.fn(),
}));

const mockGetUserFromRoom = getUserFromRoom as jest.MockedFunction<typeof getUserFromRoom>;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.MockedFunction<
	typeof updateCharacterFromRoom
>;
const mockGetRoom = getRoom as jest.MockedFunction<typeof getRoom>;

describe('cardCall119Effect', () => {
	const roomId = 1;
	const userId = 'user1';
	const targetUserId = 'user2';

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('유효성 검증', () => {
		it('사용자가 없으면 함수가 종료된다', async () => {
			mockGetUserFromRoom.mockResolvedValue(null);

			await cardCall119Effect(roomId, userId, targetUserId);

			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('사용자의 캐릭터가 없으면 함수가 종료된다', async () => {
			const user = { id: userId, nickname: 'testUser' };
			mockGetUserFromRoom.mockResolvedValue(user);

			await cardCall119Effect(roomId, userId, targetUserId);

			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('방 정보를 가져올 수 없으면 함수가 종료된다', async () => {
			const user = {
				id: userId,
				nickname: 'user1',
				character: {
					characterType: CharacterType.RED,
					roleType: RoleType.TARGET,
					hp: 3,
					weapon: 0,
					equips: [],
					debuffs: [],
					handCards: [],
					bbangCount: 0,
					handCardsCount: 0,
				},
			};

			mockGetUserFromRoom.mockResolvedValue(user);
			mockGetRoom.mockResolvedValue(null);

			await cardCall119Effect(roomId, userId, '0'); // 나머지 플레이어 회복 시도

			expect(mockGetRoom).toHaveBeenCalledWith(roomId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
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

		it('자신의 체력을 1 회복한다 (targetUserId가 "0"이 아닌 경우)', async () => {
			const user = {
				id: userId,
				nickname: 'user1',
				character: createMockCharacter(CharacterType.RED, 2),
			};

			mockGetUserFromRoom.mockResolvedValue(user);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			await cardCall119Effect(roomId, userId, 'user2'); // targetUserId != "0"이므로 자신 회복

			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...user.character,
				hp: 3,
			});
			expect(consoleSpy).toHaveBeenCalledWith(
				'[119 호출] user1의 체력이 2 → 3로 회복되었습니다. (최대: 4)',
			);

			consoleSpy.mockRestore();
		});

		it('나머지 플레이어들의 체력을 1 회복한다 (targetUserId가 "0"인 경우)', async () => {
			const user = {
				id: userId,
				nickname: 'user1',
				character: createMockCharacter(CharacterType.RED, 4),
			};
			const room = {
				id: roomId,
				ownerId: userId,
				name: 'Test Room',
				maxUserNum: 4,
				state: 1, // WAIT
				users: [
					user,
					{
						id: 'user2',
						nickname: 'user2',
						character: createMockCharacter(CharacterType.SHARK, 2),
					},
					{
						id: 'user3',
						nickname: 'user3',
						character: createMockCharacter(CharacterType.DINOSAUR, 1),
					},
				],
			};

			mockGetUserFromRoom.mockResolvedValue(user);
			mockGetRoom.mockResolvedValue(room);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			await cardCall119Effect(roomId, userId, '0'); // targetUserId가 "0"이면 나머지 회복

			// user2와 user3의 체력이 회복되어야 함 (user1은 제외)
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(2);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, 'user2', {
				...room.users[1].character,
				hp: 3,
			});
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, 'user3', {
				...room.users[2].character,
				hp: 2,
			});

			consoleSpy.mockRestore();
		});

		it('최대 체력에 도달한 경우 회복하지 않는다', async () => {
			const user = {
				id: userId,
				nickname: 'user1',
				character: createMockCharacter(CharacterType.RED, 4), // 최대 체력
			};

			mockGetUserFromRoom.mockResolvedValue(user);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			await cardCall119Effect(roomId, userId, 'user2'); // 자신 회복

			expect(consoleSpy).toHaveBeenCalledWith('[119 호출] user1의 체력이 이미 최대치(4)입니다.');
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it('공룡이 캐릭터의 최대 체력(3)을 초과하지 않는다', async () => {
			const user = {
				id: userId,
				nickname: 'user1',
				character: createMockCharacter(CharacterType.DINOSAUR, 2),
			};

			mockGetUserFromRoom.mockResolvedValue(user);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			await cardCall119Effect(roomId, userId, 'user2'); // 자신 회복

			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...user.character,
				hp: 3, // 최대 체력 3에 제한됨
			});
			expect(consoleSpy).toHaveBeenCalledWith(
				'[119 호출] user1의 체력이 2 → 3로 회복되었습니다. (최대: 3)',
			);

			consoleSpy.mockRestore();
		});

		it('핑크슬라임 캐릭터의 최대 체력(3)을 초과하지 않는다', async () => {
			const user = {
				id: userId,
				nickname: 'user1',
				character: createMockCharacter(CharacterType.PINK_SLIME, 2),
			};

			mockGetUserFromRoom.mockResolvedValue(user);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			await cardCall119Effect(roomId, userId, 'user2'); // 자신 회복

			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...user.character,
				hp: 3, // 최대 체력 3에 제한됨
			});
			expect(consoleSpy).toHaveBeenCalledWith(
				'[119 호출] user1의 체력이 2 → 3로 회복되었습니다. (최대: 3)',
			);

			consoleSpy.mockRestore();
		});
	});

	describe('에러 처리', () => {
		it('updateCharacterFromRoom에서 에러가 발생해도 함수가 정상적으로 처리된다', async () => {
			const user = {
				id: userId,
				nickname: 'user1',
				character: {
					characterType: CharacterType.RED,
					roleType: RoleType.TARGET,
					hp: 2,
					weapon: 0,
					equips: [],
					debuffs: [],
					handCards: [],
					bbangCount: 0,
					handCardsCount: 0,
				},
			};

			mockGetUserFromRoom.mockResolvedValue(user);
			mockUpdateCharacterFromRoom.mockRejectedValue(new Error('Redis error'));

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

			// 에러가 발생해도 함수가 정상적으로 처리되는지 확인
			await expect(cardCall119Effect(roomId, userId, 'user2')).resolves.not.toThrow();

			// 에러 로그가 출력되는지 확인
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[119 호출] Redis 업데이트 실패:',
				expect.any(Error),
			);

			consoleSpy.mockRestore();
			consoleErrorSpy.mockRestore();
		});
	});
});
