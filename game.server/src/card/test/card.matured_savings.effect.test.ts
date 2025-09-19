// card.matured_savings.effect.test.ts
import cardMaturedSavingsEffect from '../card.matured_savings.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/redis.util';
import { drawDeck, getDeckSize } from '../../managers/card.manager';
import { CardType } from '../../generated/common/enums';

jest.mock('../../utils/redis.util', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));
jest.mock('../../managers/card.manager', () => ({
	drawDeck: jest.fn(),
	getDeckSize: jest.fn(),
}));

const mockGetUserFromRoom = getUserFromRoom as jest.MockedFunction<typeof getUserFromRoom>;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.MockedFunction<
	typeof updateCharacterFromRoom
>;
const mockDrawDeck = drawDeck as jest.MockedFunction<typeof drawDeck>;
const mockGetDeckSize = getDeckSize as jest.MockedFunction<typeof getDeckSize>;

describe('cardMaturedSavingsEffect', () => {
	const roomId = 1;
	const userId = 'user123';

	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, 'log').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
		jest.useRealTimers();
	});

	it('유효하지 않은 사용자면 종료', async () => {
		mockGetUserFromRoom.mockResolvedValueOnce(null as any);

		cardMaturedSavingsEffect(roomId, userId);

		expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
		expect(mockDrawDeck).not.toHaveBeenCalled();
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	it('덱에 뽑을 카드가 부족하면 종료', async () => {
		mockGetUserFromRoom.mockResolvedValueOnce({
			id: userId,
			character: { handCards: [], handCardsCount: 0 },
		} as any);
		mockGetDeckSize.mockReturnValueOnce(1); // 2장 필요하지만 1장만 넣어 부족하게 세팅

		cardMaturedSavingsEffect(roomId, userId);

		expect(mockDrawDeck).not.toHaveBeenCalled();
		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
	});

	it('카드를 2장 뽑고, 뽑은 카드를 보유 카드에 추가', async () => {
		const user = {
			id: userId,
			character: { handCards: [], handCardsCount: 0 },
		};

		mockGetUserFromRoom.mockResolvedValueOnce(user as any);
		mockGetDeckSize.mockReturnValueOnce(5);
		mockDrawDeck.mockReturnValueOnce([CardType.BBANG, CardType.AUTO_RIFLE]);

		cardMaturedSavingsEffect(roomId, userId);

		expect(mockDrawDeck).toHaveBeenCalledWith(roomId, 2);
		expect(user.character!.handCards).toEqual([
			{ type: CardType.BBANG, count: 1 },
			{ type: CardType.AUTO_RIFLE, count: 1 },
		]);
		expect(user.character!.handCardsCount).toBe(2);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, user.id, user.character);
	});

	it('이미 있는 카드를 뽑으면 해당 카드의 count가 증가', async () => {
		const user = {
			id: userId,
			character: {
				handCards: [{ type: CardType.BBANG, count: 1 }], // 이미 소지하고 있는 카드 세팅
				handCardsCount: 1,
			},
		};

		mockGetUserFromRoom.mockResolvedValueOnce(user as any);
		mockGetDeckSize.mockReturnValueOnce(5);
		mockDrawDeck.mockReturnValueOnce([CardType.BBANG, CardType.AUTO_RIFLE]);

		await cardMaturedSavingsEffect(roomId, userId);

		// 같은 카드 획득 시 정상적으로 해당 count 값에 가산되는지 확인
		expect(user.character!.handCards).toEqual([
			{ type: CardType.BBANG, count: 2 },
			{ type: CardType.AUTO_RIFLE, count: 1 },
		]);
		expect(user.character!.handCardsCount).toBe(3);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, user.id, user.character);
	});

	it('updateCharacterFromRoom 실패 시 에러 로그 출력', async () => {
		const user = {
			id: userId,
			character: { handCards: [], handCardsCount: 0 },
		};

		mockGetUserFromRoom.mockResolvedValueOnce(user as any);
		mockGetDeckSize.mockReturnValueOnce(5);
		mockDrawDeck.mockReturnValueOnce([CardType.BBANG, CardType.AUTO_RIFLE]);
		mockUpdateCharacterFromRoom.mockImplementationOnce(() => Promise.reject(new Error('DB Error'))); // 임의의 에러 대입

		// await cardMaturedSavingsEffect(roomId, userId);

		// try/catch로 unhandled rejection 방지
		await expect(cardMaturedSavingsEffect(roomId, userId)).resolves.toBeUndefined();
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalled();
	});

	afterAll(() => {
		jest.restoreAllMocks();
		jest.useRealTimers();
	});
});
