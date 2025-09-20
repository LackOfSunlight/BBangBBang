import cardDeathMatchEffect from '../card.death_match.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import {
	CharacterStateType,
	CharacterType,
	RoleType,
	CardType,
} from '../../generated/common/enums';
import type { CharacterData, UserData } from '../../generated/common/types';

// Mock room utils functions
jest.mock('../../utils/room.utils', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

const mockGetUserFromRoom = getUserFromRoom as jest.MockedFunction<typeof getUserFromRoom>;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.MockedFunction<
	typeof updateCharacterFromRoom
>;

/**
 * 테스트용 캐릭터 데이터 생성 헬퍼 함수
 * hasBbang: 빵야 카드 보유 여부
 */
function makeCharacter(hasBbang: boolean): CharacterData {
	return {
		characterType: CharacterType.RED,
		roleType: RoleType.TARGET,
		hp: 3,
		weapon: 0,
		stateInfo: {
			state: CharacterStateType.NONE_CHARACTER_STATE,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: '0',
			stateTargetUserId: '0',
		},
		equips: [],
		debuffs: [],
		handCards: hasBbang
			? [{ type: CardType.BBANG, count: 1 }]
			: [{ type: CardType.SHIELD, count: 1 }],
		bbangCount: 0,
		handCardsCount: 1,
	};
}

describe('cardDeathMatchEffect', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('성공 케이스', () => {
		it('현피 카드 사용 시 두 플레이어의 상태를 올바르게 설정하고 Redis 업데이트 호출', () => {
			// Given: 현피 카드를 사용할 공격자와 대상자 설정
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user: UserData = {
				id: userId,
				nickname: '사용자1',
				character: makeCharacter(true), // BBANG 카드 보유
			};

			const target: UserData = {
				id: targetUserId,
				nickname: '사용자2',
				character: makeCharacter(true),
			};

			// Mock 설정: getUserFromRoom이 순차적으로 user, target을 반환
			mockGetUserFromRoom.mockReturnValueOnce(user).mockReturnValueOnce(target);
			mockUpdateCharacterFromRoom.mockReturnValue(undefined as unknown as void);

			// When: 현피 카드 효과 실행
			cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then: Redis 조회 함수들이 올바른 인자로 호출되었는지 확인
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, targetUserId);

			// 공격자(사용자) 상태 검증: DEATH_MATCH_TURN_STATE로 설정되어야 함
			expect(user.character!.stateInfo!.state).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);
			expect(user.character!.stateInfo!.nextState).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(user.character!.stateInfo!.nextStateAt).toBe('0');
			expect(user.character!.stateInfo!.stateTargetUserId).toBe(targetUserId);

			// 대상자 상태 검증: DEATH_MATCH_STATE로 설정되어야 함
			expect(target.character!.stateInfo!.state).toBe(CharacterStateType.DEATH_MATCH_STATE);
			expect(target.character!.stateInfo!.nextState).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(target.character!.stateInfo!.nextStateAt).toBe('0');
			expect(target.character!.stateInfo!.stateTargetUserId).toBe(userId);

			// Redis 업데이트 함수들이 올바른 인자로 호출되었는지 확인
			// 실제 Redis 키는 updateCharacterFromRoom 내부에서 'room:${roomId}' 형태로 사용됨
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, user.character);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(
				roomId,
				targetUserId,
				target.character,
			);
		});

		it('현피 카드 사용 시 정상적으로 처리되는지 확인', () => {
			// Given: 정상적인 현피 카드 사용 시나리오
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user: UserData = {
				id: userId,
				nickname: '사용자1',
				character: makeCharacter(true),
			};

			const target: UserData = {
				id: targetUserId,
				nickname: '사용자2',
				character: makeCharacter(true),
			};

			mockGetUserFromRoom.mockReturnValueOnce(user).mockReturnValueOnce(target);
			mockUpdateCharacterFromRoom.mockReturnValue(undefined as unknown as void);

			// When: 현피 카드 효과 실행
			const result = cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then: 정상적으로 처리되었는지 확인
			expect(result).toBe(true);
		});
	});

	describe('실패 케이스', () => {
		it('사용자가 존재하지 않으면 조기 종료', () => {
			// Given: 사용자가 존재하지 않는 상황
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			mockGetUserFromRoom.mockReturnValue(null as any);

			// When: 현피 카드 효과 실행
			cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then: 사용자 조회만 시도하고 대상자 조회나 업데이트는 하지 않아야 함
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockGetUserFromRoom).not.toHaveBeenCalledWith(roomId, targetUserId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('대상이 존재하지 않으면 조기 종료', () => {
			// Given: 사용자는 존재하지만 대상자가 존재하지 않는 상황
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user: UserData = { id: userId, nickname: '사용자1', character: makeCharacter(true) };

			mockGetUserFromRoom.mockReturnValueOnce(user).mockReturnValueOnce(null as any);

			// When: 현피 카드 효과 실행
			cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then: 사용자와 대상자 조회는 시도하지만 업데이트는 하지 않아야 함
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, targetUserId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('사용자 캐릭터가 없으면 조기 종료', () => {
			// Given: 사용자는 존재하지만 캐릭터가 없는 상황
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user: UserData = { id: userId, nickname: '사용자1', character: undefined };

			mockGetUserFromRoom.mockReturnValue(user);

			// When: 현피 카드 효과 실행
			cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then: 사용자 조회만 시도하고 대상자 조회나 업데이트는 하지 않아야 함
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockGetUserFromRoom).not.toHaveBeenCalledWith(roomId, targetUserId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('대상 캐릭터가 없으면 조기 종료', () => {
			// Given: 사용자와 대상자는 존재하지만 대상자의 캐릭터가 없는 상황
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user: UserData = { id: userId, nickname: '사용자1', character: makeCharacter(true) };
			const target: UserData = { id: targetUserId, nickname: '사용자2', character: undefined };

			mockGetUserFromRoom.mockReturnValueOnce(user).mockReturnValueOnce(target);

			// When: 현피 카드 효과 실행
			cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then: 사용자와 대상자 조회는 시도하지만 업데이트는 하지 않아야 함
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
			expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, targetUserId);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('빵야 카드가 없으면 조기 종료', () => {
			// Given: 사용자가 빵야 카드를 보유하지 않은 상황
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user: UserData = { id: userId, nickname: '사용자1', character: makeCharacter(false) }; // BBANG 카드 없음
			const target: UserData = {
				id: targetUserId,
				nickname: '사용자2',
				character: makeCharacter(true),
			};

			mockGetUserFromRoom.mockReturnValueOnce(user).mockReturnValueOnce(target);

			// When: 현피 카드 효과 실행
			const result = cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then: 실패해야 함
			expect(result).toBe(false);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('업데이트 실패 시 에러 처리', () => {
			// Given: 정상적인 현피 카드 사용이지만 업데이트가 실패하는 상황
			const roomId = 1;
			const userId = 'user1';
			const targetUserId = 'user2';

			const user: UserData = { id: userId, nickname: '사용자1', character: makeCharacter(true) };
			const target: UserData = {
				id: targetUserId,
				nickname: '사용자2',
				character: makeCharacter(true),
			};

			mockGetUserFromRoom.mockReturnValueOnce(user).mockReturnValueOnce(target);
			mockUpdateCharacterFromRoom.mockImplementation(() => {
				throw new Error('업데이트 실패');
			});

			// When: 현피 카드 효과 실행
			const result = cardDeathMatchEffect(roomId, userId, targetUserId);

			// Then: 실패해야 함
			expect(result).toBe(false);
		});
	});
});
