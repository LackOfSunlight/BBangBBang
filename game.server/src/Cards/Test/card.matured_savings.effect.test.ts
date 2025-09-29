// card.matured_savings.effect.test.ts
import cardMaturedSavingsEffect from '../Active/card.matured_savings.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../Utils/room.utils';
import { cardManager } from '../../Managers/card.manager';
import { CardType } from '../../Generated/common/enums';

jest.mock('../../utils/room.utils', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));
jest.mock('../../managers/card.manager');

describe('cardMaturedSavingsEffect', () => {
	const roomId = 1;
	const userId = 'user123';

	const mockUser = {
		id: userId,
		character: {
			handCards: [],
			handCardsCount: 0,
		},
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('잘못된 사용자일 경우 false 반환', () => {
		(getUserFromRoom as jest.Mock).mockReturnValue(null);

		const result = cardMaturedSavingsEffect(roomId, userId);

		expect(result).toBe(false);
		expect(getUserFromRoom).toHaveBeenCalledWith(roomId, userId);
	});

	it('덱 매수가 부족할 경우 false 반환', () => {
		(getUserFromRoom as jest.Mock).mockReturnValue(mockUser);
		(cardManager.getDeckSize as jest.Mock).mockReturnValue(1); // 필요한 2장보다 부족한 1장 추가

		const result = cardMaturedSavingsEffect(roomId, userId);

		expect(result).toBe(false);
		expect(cardManager.getDeckSize).toHaveBeenCalledWith(roomId);
	});

	it('카드 2장을 뽑고 소지 카드에 추가', () => {
		(getUserFromRoom as jest.Mock).mockReturnValue({
			...mockUser,
			character: { handCards: [], handCardsCount: 0 },
		});
		(cardManager.getDeckSize as jest.Mock).mockReturnValue(10);
		(cardManager.drawDeck as jest.Mock).mockReturnValue([CardType.BBANG, CardType.SHIELD]);
		(updateCharacterFromRoom as jest.Mock).mockReturnValue(true);

		const result = cardMaturedSavingsEffect(roomId, userId); // jest.fn()은 toHaveBeenCalledWith으로 처리하기 힘들기에 jest.fn을 처리한 변수를 대신 대입

		expect(result).toBe(true);
		expect(cardManager.drawDeck).toHaveBeenCalledWith(roomId, 2);
		expect(updateCharacterFromRoom).toHaveBeenCalled();
		const updatedUser = (updateCharacterFromRoom as jest.Mock).mock.calls[0][2];
		expect(updatedUser.handCards.length).toBe(2);
		expect(updatedUser.handCardsCount).toBe(2);
	});

	it('이미 소지한 카드를 또 뽑으면 count 증가', () => {
		(getUserFromRoom as jest.Mock).mockReturnValue({
			...mockUser,
			character: {
				handCards: [{ type: CardType.BBANG, count: 1 }],
				handCardsCount: 1,
			},
		});
		(cardManager.getDeckSize as jest.Mock).mockReturnValue(10);
		(cardManager.drawDeck as jest.Mock).mockReturnValue([CardType.BBANG, CardType.BBANG]);
		(updateCharacterFromRoom as jest.Mock).mockReturnValue(true);

		const result = cardMaturedSavingsEffect(roomId, userId);

		expect(result).toBe(true);
		const updatedUser = (updateCharacterFromRoom as jest.Mock).mock.calls[0][2];
		expect(updatedUser.handCards[0].count).toBe(3);
		expect(updatedUser.handCardsCount).toBe(3);
	});

	it('updateCharacterFromRoom 실패 시 false 반환', () => {
		(getUserFromRoom as jest.Mock).mockReturnValue(mockUser);
		(cardManager.getDeckSize as jest.Mock).mockReturnValue(10);
		(cardManager.drawDeck as jest.Mock).mockReturnValue([CardType.BBANG, CardType.SHIELD]);
		(updateCharacterFromRoom as jest.Mock).mockImplementation(() => {
			throw new Error('DB Error');
		});

		const result = cardMaturedSavingsEffect(roomId, userId);

		expect(result).toBe(false);
	});
});
