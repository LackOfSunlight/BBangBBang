import cardWinLotteryEffect from '../Active/card.win_lottery.effect';
import * as roomUtils from '../../Utils/room.utils';
import { cardManager } from '../../Managers/card.manager';
import { CharacterType, RoleType, CardType } from '../../Generated/common/enums';
import { User } from '../../Models/user.model';

jest.mock('../../utils/room.utils');
jest.mock('../../managers/card.manager');

const mockGetUserFromRoom = jest.spyOn(roomUtils, 'getUserFromRoom');
const mockUpdateCharacterFromRoom = jest.spyOn(roomUtils, 'updateCharacterFromRoom');
const mockDrawDeck = jest.spyOn(cardManager, 'drawDeck');
const mockRemoveCard = jest.spyOn(cardManager, 'removeCard');

beforeAll(() => {
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
	jest.restoreAllMocks();
});

describe('cardWinLotteryEffect', () => {
	const roomId = 1;
	const userId = 'user1';

	beforeEach(() => {
		jest.clearAllMocks();
		mockRemoveCard.mockImplementation(() => {});
	});

	const createMockCharacter = (handCards: Array<{ type: CardType; count: number }> = []) => ({
		characterType: CharacterType.RED,
		roleType: RoleType.TARGET,
		hp: 3,
		weapon: 0,
		equips: [],
		debuffs: [],
		handCards,
		bbangCount: 0,
		handCardsCount: handCards.reduce((total, card) => total + card.count, 0),
	});

	describe('유효성 검증', () => {
		it('사용자가 없으면 함수가 종료된다', () => {
			// @ts-expect-error: 테스트를 위한 모킹
			mockGetUserFromRoom.mockReturnValue(null);

			const result = cardWinLotteryEffect(roomId, userId);

			expect(result).toBe(false);
			expect(mockRemoveCard).not.toHaveBeenCalled();
			expect(mockDrawDeck).not.toHaveBeenCalled();
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('사용자의 캐릭터가 없으면 함수가 종료된다', () => {
			mockGetUserFromRoom.mockReturnValue({
				id: userId,
				nickname: 'testUser',
				// character 속성이 없음
			} as User);

			const result = cardWinLotteryEffect(roomId, userId);

			expect(result).toBe(false);
			expect(mockRemoveCard).not.toHaveBeenCalled();
			expect(mockDrawDeck).not.toHaveBeenCalled();
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
		});

		it('덱에 카드가 없으면 함수가 종료된다', () => {
			const mockCharacter = createMockCharacter();
			mockGetUserFromRoom.mockReturnValue({
				id: userId,
				nickname: 'testUser',
				character: mockCharacter,
			} as User);

			mockDrawDeck.mockReturnValue([]);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			const result = cardWinLotteryEffect(roomId, userId);

			expect(result).toBe(false);
			expect(mockRemoveCard).toHaveBeenCalledTimes(1);
			expect(mockDrawDeck).toHaveBeenCalledTimes(1);
			expect(consoleSpy).toHaveBeenCalledWith('[복권 당첨] testUser: 덱에 카드가 없습니다.');
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe('카드 획득 로직', () => {
		it('새로운 카드 3장을 획득한다', () => {
			const mockCharacter = createMockCharacter([]);
			mockGetUserFromRoom.mockReturnValue({
				id: userId,
				nickname: 'testUser',
				character: mockCharacter,
			});

			const newCards = [CardType.BBANG, CardType.SHIELD, CardType.BOMB];
			mockDrawDeck.mockReturnValue(newCards);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			const result = cardWinLotteryEffect(roomId, userId);

			expect(result).toBe(true);
			expect(mockRemoveCard).toHaveBeenCalledTimes(1);
			expect(mockDrawDeck).toHaveBeenCalledWith(roomId, 3);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, mockCharacter);
			expect(mockCharacter.handCards).toEqual([
				{ type: CardType.BBANG, count: 1 },
				{ type: CardType.SHIELD, count: 1 },
				{ type: CardType.BOMB, count: 1 },
			]);
			expect(mockCharacter.handCardsCount).toBe(3);
			expect(consoleSpy).toHaveBeenCalledWith(
				'[복권 당첨] testUser이 카드 3장을 획득했습니다:',
				'BBANG, SHIELD, BOMB',
			);

			consoleSpy.mockRestore();
		});

		it('기존 카드와 중복되면 count가 증가한다', () => {
			const existingCards = [
				{ type: CardType.BBANG, count: 2 },
				{ type: CardType.SHIELD, count: 1 },
			];
			const mockCharacter = createMockCharacter(existingCards);
			mockGetUserFromRoom.mockReturnValue({
				id: userId,
				nickname: 'testUser',
				character: mockCharacter,
			});

			const newCards = [CardType.BBANG, CardType.SHIELD, CardType.BOMB];
			mockDrawDeck.mockReturnValue(newCards);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			const result = cardWinLotteryEffect(roomId, userId);

			expect(result).toBe(true);
			expect(mockCharacter.handCards).toEqual([
				{ type: CardType.BBANG, count: 3 },
				{ type: CardType.SHIELD, count: 2 },
				{ type: CardType.BOMB, count: 1 },
			]);
			expect(mockCharacter.handCardsCount).toBe(6);

			consoleSpy.mockRestore();
		});

		it('덱에 카드가 부족하면 받을 수 있는 만큼만 받는다', () => {
			const mockCharacter = createMockCharacter([]);
			mockGetUserFromRoom.mockReturnValue({
				id: userId,
				nickname: 'testUser',
				character: mockCharacter,
			});

			const newCards = [CardType.BBANG, CardType.SHIELD];
			mockDrawDeck.mockReturnValue(newCards);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			const result = cardWinLotteryEffect(roomId, userId);

			expect(result).toBe(true);
			expect(mockCharacter.handCards).toEqual([
				{ type: CardType.BBANG, count: 1 },
				{ type: CardType.SHIELD, count: 1 },
			]);
			expect(mockCharacter.handCardsCount).toBe(2);
			expect(consoleSpy).toHaveBeenCalledWith(
				'[복권 당첨] testUser이 카드 2장을 획득했습니다:',
				'BBANG, SHIELD',
			);

			consoleSpy.mockRestore();
		});

		it('같은 카드가 여러 번 나오면 count가 누적된다', () => {
			const mockCharacter = createMockCharacter([]);
			mockGetUserFromRoom.mockReturnValue({
				id: userId,
				nickname: 'testUser',
				character: mockCharacter,
			});

			const newCards = [CardType.BBANG, CardType.BBANG, CardType.BBANG];
			mockDrawDeck.mockReturnValue(newCards);

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			const result = cardWinLotteryEffect(roomId, userId);

			expect(result).toBe(true);
			expect(mockCharacter.handCards).toEqual([{ type: CardType.BBANG, count: 3 }]);
			expect(mockCharacter.handCardsCount).toBe(3);

			consoleSpy.mockRestore();
		});
	});

	describe('에러 처리', () => {
		it('사용자 조회에서 에러가 발생하면 에러가 전파된다', () => {
			mockGetUserFromRoom.mockImplementation(() => {
				throw new Error('User not found');
			});

			expect(() => cardWinLotteryEffect(roomId, userId)).toThrow('User not found');
		});

		it('updateCharacterFromRoom에서 에러가 발생하면 에러가 처리된다', () => {
			const mockCharacter = createMockCharacter([]);
			mockGetUserFromRoom.mockReturnValue({
				id: userId,
				nickname: 'testUser',
				character: mockCharacter,
			});

			mockDrawDeck.mockReturnValue([CardType.BBANG, CardType.SHIELD, CardType.BOMB]);

			mockUpdateCharacterFromRoom.mockImplementation(() => {
				throw new Error('Update error');
			});

			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

			const result = cardWinLotteryEffect(roomId, userId);

			expect(result).toBe(false);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[복권 당첨] Redis 업데이트 실패:',
				expect.any(Error),
			);

			consoleErrorSpy.mockRestore();
		});

		it('drawDeck에서 에러가 발생하면 에러가 전파된다', () => {
			const mockCharacter = createMockCharacter([]);
			mockGetUserFromRoom.mockReturnValue({
				id: userId,
				nickname: 'testUser',
				character: mockCharacter,
			});

			mockDrawDeck.mockImplementation(() => {
				throw new Error('Deck error');
			});

			expect(() => cardWinLotteryEffect(roomId, userId)).toThrow('Deck error');
		});
	});
});
