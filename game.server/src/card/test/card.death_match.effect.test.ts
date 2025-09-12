import cardDeathMatchEffect from '../card.death_match.effect.js';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/redis.util.js';
import { CharacterStateType } from '../../generated/common/enums.js';

// Mock 설정
jest.mock('../../utils/redis.util.js');
const mockGetUserFromRoom = getUserFromRoom as jest.MockedFunction<typeof getUserFromRoom>;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.MockedFunction<
	typeof updateCharacterFromRoom
>;

describe('cardDeathMatchEffect', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('성공 케이스', () => {
		it('현피 카드 사용 시 두 플레이어의 상태를 올바르게 설정해야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user = {
				id: userId,
				nickname: '사용자1',
				character: {
					stateInfo: {
						state: CharacterStateType.NONE_CHARACTER_STATE,
						nextState: CharacterStateType.NONE_CHARACTER_STATE,
						nextStateAt: '0',
						stateTargetUserId: '0',
					},
				},
			};

			const target = {
				id: targetUserId,
				nickname: '사용자2',
				character: {
					stateInfo: {
						state: CharacterStateType.NONE_CHARACTER_STATE,
						nextState: CharacterStateType.NONE_CHARACTER_STATE,
						nextStateAt: '0',
						stateTargetUserId: '0',
					},
				},
			};

			mockGetUserFromRoom.mockResolvedValueOnce(user).mockResolvedValueOnce(target);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When
			await cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, targetUserId);

			// 사용자 상태 확인
			expect(user.character.stateInfo.state).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);
			expect(user.character.stateInfo.stateTargetUserId).toBe(targetUserId);

			// 대상 상태 확인
			expect(target.character.stateInfo.state).toBe(CharacterStateType.DEATH_MATCH_STATE);
			expect(target.character.stateInfo.stateTargetUserId).toBe(userId);

			// Redis 업데이트 확인
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, user.character);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(
				roomId,
				targetUserId,
				target.character,
			);
		});

		it('현피 카드 사용 시 콘솔 로그가 출력되어야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user = {
				id: userId,
				nickname: '사용자1',
				character: { stateInfo: {} },
			};

			const target = {
				id: targetUserId,
				nickname: '사용자2',
				character: { stateInfo: {} },
			};

			mockGetUserFromRoom.mockResolvedValueOnce(user).mockResolvedValueOnce(target);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			// When
			await cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then
			expect(consoleSpy).toHaveBeenCalledWith('[현피] 사용자1이 사용자2에게 현피를 걸었습니다.');

			consoleSpy.mockRestore();
		});
	});

	describe('실패 케이스', () => {
		it('사용자가 존재하지 않으면 함수가 조기 종료되어야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			mockGetUserFromRoom.mockResolvedValue(null);

			// When
			await cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockGetUserFromRoom).not.toHaveBeenCalledWith(roomId, targetUserId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('대상이 존재하지 않으면 함수가 조기 종료되어야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user = {
				id: userId,
				nickname: '사용자1',
				character: { stateInfo: {} },
			};

			mockGetUserFromRoom.mockResolvedValueOnce(user).mockResolvedValueOnce(null);

			// When
			await cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, targetUserId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('사용자의 캐릭터가 없으면 함수가 조기 종료되어야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user = {
				id: userId,
				nickname: '사용자1',
				character: null,
			};

			mockGetUserFromRoom.mockResolvedValue(user);

			// When
			await cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockGetUserFromRoom).not.toHaveBeenCalledWith(roomId, targetUserId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('대상의 캐릭터가 없으면 함수가 조기 종료되어야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user = {
				id: userId,
				nickname: '사용자1',
				character: { stateInfo: {} },
			};

			const target = {
				id: targetUserId,
				nickname: '사용자2',
				character: null,
			};

			mockGetUserFromRoom.mockResolvedValueOnce(user).mockResolvedValueOnce(target);

			// When
			await cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, targetUserId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('Redis 업데이트 실패 시 에러가 로그에 출력되어야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user = {
				id: userId,
				nickname: '사용자1',
				character: { stateInfo: {} },
			};

			const target = {
				id: targetUserId,
				nickname: '사용자2',
				character: { stateInfo: {} },
			};

			mockGetUserFromRoom.mockResolvedValueOnce(user).mockResolvedValueOnce(target);
			mockUpdateCharacterFromRoom.mockRejectedValue(new Error('Redis 업데이트 실패'));

			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

			// When
			await cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[현피] Redis 업데이트 실패:',
				expect.any(Error),
			);

			consoleErrorSpy.mockRestore();
		});
	});

	describe('상태 설정 검증', () => {
		it('사용자의 상태가 DEATH_MATCH_TURN_STATE로 설정되어야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user = {
				id: userId,
				nickname: '사용자1',
				character: { stateInfo: {} },
			};

			const target = {
				id: targetUserId,
				nickname: '사용자2',
				character: { stateInfo: {} },
			};

			mockGetUserFromRoom.mockResolvedValueOnce(user).mockResolvedValueOnce(target);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When
			await cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then
			expect(user.character.stateInfo.state).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);
			expect(user.character.stateInfo.nextState).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(user.character.stateInfo.nextStateAt).toBe('0');
			expect(user.character.stateInfo.stateTargetUserId).toBe(targetUserId);
		});

		it('대상의 상태가 DEATH_MATCH_STATE로 설정되어야 함', async () => {
			// Given
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user = {
				id: userId,
				nickname: '사용자1',
				character: { stateInfo: {} },
			};

			const target = {
				id: targetUserId,
				nickname: '사용자2',
				character: { stateInfo: {} },
			};

			mockGetUserFromRoom.mockResolvedValueOnce(user).mockResolvedValueOnce(target);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			// When
			await cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then
			expect(target.character.stateInfo.state).toBe(CharacterStateType.DEATH_MATCH_STATE);
			expect(target.character.stateInfo.nextState).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(target.character.stateInfo.nextStateAt).toBe('0');
			expect(target.character.stateInfo.stateTargetUserId).toBe(userId);
		});
	});
});
