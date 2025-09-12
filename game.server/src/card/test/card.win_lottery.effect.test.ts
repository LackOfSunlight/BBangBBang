import cardWinLotteryEffect from '../card.win_lottery.effect.js';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/redis.util.js';
import { drawDeck } from '../../managers/card.manager.js';
import { CardType, CharacterType, RoleType } from '../../generated/common/enums.js';
import { CharacterData } from '../../generated/common/types.js';

// Mock dependencies
jest.mock('../../utils/redis.util.js');
jest.mock('../../managers/card.manager.js');

const mockGetUserFromRoom = getUserFromRoom as jest.MockedFunction<typeof getUserFromRoom>;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.MockedFunction<
	typeof updateCharacterFromRoom
>;
const mockDrawDeck = drawDeck as jest.MockedFunction<typeof drawDeck>;

describe('cardWinLotteryEffect', () => {
	const roomId = 1;
	const userId = 'user123';

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('유효성 검증', () => {
		it('사용자가 없으면 아무것도 하지 않음', async () => {
			mockGetUserFromRoom.mockResolvedValue(null);

			await cardWinLotteryEffect(roomId, userId);

			expect(mockDrawDeck).not.toHaveBeenCalled();
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('사용자 캐릭터가 없으면 아무것도 하지 않음', async () => {
			mockGetUserFromRoom.mockResolvedValue({
				id: userId,
				nickname: '테스트유저',
				character: undefined,
			});

			await cardWinLotteryEffect(roomId, userId);

			expect(mockDrawDeck).not.toHaveBeenCalled();
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});
	});

	describe('카드 획득 로직', () => {
		const mockUser = {
			id: userId,
			nickname: '테스트유저',
			character: {
				characterType: CharacterType.RED,
				roleType: RoleType.NONE_ROLE,
				hp: 3,
				weapon: 0,
				stateInfo: undefined,
				equips: [],
				debuffs: [],
				handCards: [
					{ type: CardType.BBANG, count: 1 }, // 기존 카드
					{ type: CardType.SHIELD, count: 1 },
				],
				bbangCount: 1,
				handCardsCount: 2,
			} as CharacterData,
		};

		it('덱에서 카드 3장을 뽑아서 핸드에 추가', async () => {
			const newCardTypes = [CardType.VACCINE, CardType.CALL_119, CardType.DEATH_MATCH]; // 새로운 카드 타입들
			mockGetUserFromRoom.mockResolvedValue(mockUser);
			mockDrawDeck.mockReturnValue(newCardTypes);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			await cardWinLotteryEffect(roomId, userId);

			expect(mockDrawDeck).toHaveBeenCalledWith(roomId, 3);
			expect(mockUser.character.handCards).toHaveLength(5); // 기존 2장 + 새로 3장
			expect(mockUser.character.handCards).toContainEqual({ type: CardType.VACCINE, count: 1 });
			expect(mockUser.character.handCards).toContainEqual({ type: CardType.CALL_119, count: 1 });
			expect(mockUser.character.handCards).toContainEqual({ type: CardType.DEATH_MATCH, count: 1 });
			expect(mockUser.character.handCardsCount).toBe(5); // handCardsCount 업데이트 확인
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, mockUser.character);
		});

		it('같은 타입의 카드가 이미 있으면 count 증가', async () => {
			const mockUserWithExistingCards = {
				id: userId,
				nickname: '테스트유저',
				character: {
					characterType: CharacterType.RED,
					roleType: RoleType.NONE_ROLE,
					hp: 3,
					weapon: 0,
					stateInfo: undefined,
					equips: [],
					debuffs: [],
					handCards: [
						{ type: CardType.BBANG, count: 2 }, // 기존에 2장
						{ type: CardType.SHIELD, count: 1 },
					],
					bbangCount: 1,
					handCardsCount: 3,
				} as CharacterData,
			};

			const newCardTypes = [CardType.BBANG, CardType.VACCINE]; // BBANG은 중복, VACCINE은 새로
			mockGetUserFromRoom.mockResolvedValue(mockUserWithExistingCards);
			mockDrawDeck.mockReturnValue(newCardTypes);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			await cardWinLotteryEffect(roomId, userId);

			// BBANG은 count가 2에서 3으로 증가
			const bbangCard = mockUserWithExistingCards.character.handCards.find(
				(card) => card.type === CardType.BBANG,
			);
			expect(bbangCard?.count).toBe(3);

			// VACCINE은 새로 추가
			expect(mockUserWithExistingCards.character.handCards).toContainEqual({
				type: CardType.VACCINE,
				count: 1,
			});

			// 총 카드 개수는 4개 (BBANG 3장 + SHIELD 1장 + VACCINE 1장)
			expect(mockUserWithExistingCards.character.handCardsCount).toBe(5);
		});

		it('덱에 카드가 없으면 아무것도 하지 않음', async () => {
			const mockUserEmptyDeck = {
				id: userId,
				nickname: '테스트유저',
				character: {
					characterType: CharacterType.RED,
					roleType: RoleType.NONE_ROLE,
					hp: 3,
					weapon: 0,
					stateInfo: undefined,
					equips: [],
					debuffs: [],
					handCards: [
						{ type: CardType.BBANG, count: 1 },
						{ type: CardType.SHIELD, count: 1 },
					],
					bbangCount: 1,
					handCardsCount: 2,
				} as CharacterData,
			};

			mockGetUserFromRoom.mockResolvedValue(mockUserEmptyDeck);
			mockDrawDeck.mockReturnValue([]);

			await cardWinLotteryEffect(roomId, userId);

			expect(mockUserEmptyDeck.character.handCards).toHaveLength(2); // 기존 카드만 유지
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('덱에 카드가 3장 미만이면 있는 만큼만 획득', async () => {
			const mockUserPartialDeck = {
				id: userId,
				nickname: '테스트유저',
				character: {
					characterType: CharacterType.RED,
					roleType: RoleType.NONE_ROLE,
					hp: 3,
					weapon: 0,
					stateInfo: undefined,
					equips: [],
					debuffs: [],
					handCards: [
						{ type: CardType.BBANG, count: 1 },
						{ type: CardType.SHIELD, count: 1 },
					],
					bbangCount: 1,
					handCardsCount: 2,
				} as CharacterData,
			};

			const newCardTypes = [CardType.VACCINE, CardType.CALL_119]; // 2장만 획득
			mockGetUserFromRoom.mockResolvedValue(mockUserPartialDeck);
			mockDrawDeck.mockReturnValue(newCardTypes);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			await cardWinLotteryEffect(roomId, userId);

			expect(mockUserPartialDeck.character.handCards).toHaveLength(4); // 기존 2장 + 새로 2장
			expect(mockUserPartialDeck.character.handCardsCount).toBe(4); // handCardsCount 업데이트 확인
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(
				roomId,
				userId,
				mockUserPartialDeck.character,
			);
		});
	});

	describe('에러 처리', () => {
		const mockUser = {
			id: userId,
			nickname: '테스트유저',
			character: {
				characterType: CharacterType.RED,
				roleType: RoleType.NONE_ROLE,
				hp: 3,
				weapon: 0,
				stateInfo: undefined,
				equips: [],
				debuffs: [],
				handCards: [],
				bbangCount: 1,
				handCardsCount: 0,
			} as CharacterData,
		};

		it('Redis 업데이트 실패 시 에러 로깅', async () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
			const newCardTypes = [CardType.VACCINE, CardType.CALL_119, CardType.DEATH_MATCH];

			mockGetUserFromRoom.mockResolvedValue(mockUser);
			mockDrawDeck.mockReturnValue(newCardTypes);
			mockUpdateCharacterFromRoom.mockRejectedValue(new Error('Redis 연결 실패'));

			await cardWinLotteryEffect(roomId, userId);

			expect(consoleSpy).toHaveBeenCalledWith(
				'[복권 당첨] Redis 업데이트 실패:',
				expect.any(Error),
			);

			consoleSpy.mockRestore();
		});
	});

	describe('로깅', () => {
		const mockUser = {
			id: userId,
			nickname: '테스트유저',
			character: {
				characterType: CharacterType.RED,
				roleType: RoleType.NONE_ROLE,
				hp: 3,
				weapon: 0,
				stateInfo: undefined,
				equips: [],
				debuffs: [],
				handCards: [],
				bbangCount: 1,
				handCardsCount: 0,
			} as CharacterData,
		};

		it('카드 획득 성공 시 로그 출력', async () => {
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
			const newCardTypes = [CardType.VACCINE, CardType.CALL_119, CardType.DEATH_MATCH];

			mockGetUserFromRoom.mockResolvedValue(mockUser);
			mockDrawDeck.mockReturnValue(newCardTypes);
			mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

			await cardWinLotteryEffect(roomId, userId);

			expect(consoleSpy).toHaveBeenCalledWith(
				'[복권 당첨] 테스트유저이 카드 3장을 획득했습니다:',
				'VACCINE, CALL_119, DEATH_MATCH',
			);

			consoleSpy.mockRestore();
		});

		it('덱에 카드가 없을 때 로그 출력', async () => {
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			mockGetUserFromRoom.mockResolvedValue(mockUser);
			mockDrawDeck.mockReturnValue([]);

			await cardWinLotteryEffect(roomId, userId);

			expect(consoleSpy).toHaveBeenCalledWith('[복권 당첨] 테스트유저: 덱에 카드가 없습니다.');

			consoleSpy.mockRestore();
		});
	});
});
