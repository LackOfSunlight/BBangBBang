import cardHandGunEffect from '../card.hand_gun.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/redis.util';
import { CharacterType, RoleType } from '../../generated/common/enums';

// Mock 설정
jest.mock('../../utils/redis.util', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

const mockGetUserFromRoom = getUserFromRoom as jest.MockedFunction<typeof getUserFromRoom>;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.MockedFunction<
	typeof updateCharacterFromRoom
>;

describe('cardHandGunEffect', () => {
	const roomId = 1;
	const userId = 'user1';
	const targetUserId = 'user2';

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('유효성 검증', () => {
		it('사용자가 없으면 함수가 종료된다', async () => {
			mockGetUserFromRoom.mockResolvedValue(null);

			await cardHandGunEffect(roomId, userId);

			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('사용자의 캐릭터가 없으면 함수가 종료된다', async () => {
			const user = { id: userId, nickname: 'testUser' };
			mockGetUserFromRoom.mockResolvedValue(user);

			await cardHandGunEffect(roomId, userId);

			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('사용자의 캐릭터가 없으면 함수가 종료된다', async () => {
			const user = { id: userId, nickname: 'testUser' };
			mockGetUserFromRoom.mockResolvedValue(user);

			await cardHandGunEffect(roomId, userId);

			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});
	});

	describe('빵야! 횟수 증가 로직', () => {
		const createMockCharacter = (bbangCount: number) => ({
			characterType: CharacterType.RED,
			roleType: RoleType.TARGET,
			hp: 3,
			weapon: 0,
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount,
			handCardsCount: 0,
		});

		it('자신의 빵야! 횟수를 2로 설정한다 (targetUserId 무시)', async () => {
			const user = {
				id: userId,
				nickname: 'user1',
				character: createMockCharacter(1), // 기본 빵야! 횟수
			};

			mockGetUserFromRoom.mockResolvedValue(user);

			await cardHandGunEffect(roomId, userId); // targetUserId는 무시됨

			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...user.character,
				bbangCount: 2, // 2로 고정 설정
			});
		});

		it('이미 핸드건 효과를 받은 경우 설정하지 않는다 (bbangCount >= 2)', async () => {
			const user = {
				id: userId,
				nickname: 'user1',
				character: createMockCharacter(2), // 이미 핸드건 효과 적용됨
			};

			mockGetUserFromRoom.mockResolvedValue(user);

			await cardHandGunEffect(roomId, userId);

			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('빵야! 횟수가 3 이상인 경우 설정하지 않는다', async () => {
			const user = {
				id: userId,
				nickname: 'user1',
				character: createMockCharacter(3), // 빵야! 횟수 3
			};

			mockGetUserFromRoom.mockResolvedValue(user);

			await cardHandGunEffect(roomId, userId);

			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('빵야! 횟수가 0인 경우 2로 설정한다', async () => {
			const user = {
				id: userId,
				nickname: 'user1',
				character: createMockCharacter(0), // 빵야! 횟수 0
			};

			mockGetUserFromRoom.mockResolvedValue(user);

			await cardHandGunEffect(roomId, userId);

			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
				...user.character,
				bbangCount: 2, // 2로 고정 설정
			});
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
					hp: 3,
					weapon: 0,
					equips: [],
					debuffs: [],
					handCards: [],
					bbangCount: 1,
					handCardsCount: 0,
				},
			};

			mockGetUserFromRoom.mockResolvedValue(user);
			mockUpdateCharacterFromRoom.mockRejectedValue(new Error('Redis error'));

			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

			// 에러가 발생해도 함수가 정상적으로 처리되는지 확인
			await expect(cardHandGunEffect(roomId, userId)).resolves.not.toThrow();

			// 에러 로그가 출력되는지 확인
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[핸드건] Redis 업데이트 실패:',
				expect.any(Error),
			);

			consoleErrorSpy.mockRestore();
		});
	});
});
