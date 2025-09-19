// card.matured_savings.effect.test.ts
import cardMaturedSavingsEffect from '../card.matured_savings.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { drawDeck, getDeckSize } from '../../managers/card.manager';
import { CardType } from '../../generated/common/enums';

jest.mock('../../utils/room.utils', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));
jest.mock('../../managers/card.manager', () => ({
	drawDeck: jest.fn(),
	getDeckSize: jest.fn(),
}));

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
    (getDeckSize as jest.Mock).mockReturnValue(1); // 필요한 2장보다 부족

    const result = cardMaturedSavingsEffect(roomId, userId);

    expect(result).toBe(false);
    expect(getDeckSize).toHaveBeenCalledWith(roomId);
  });


  it('카드 2장을 뽑고 소지 카드에 추가', () => {
    (getUserFromRoom as jest.Mock).mockReturnValue({
      ...mockUser,
      character: { handCards: [], handCardsCount: 0 },
    });
    (getDeckSize as jest.Mock).mockReturnValue(10);
    (drawDeck as jest.Mock).mockReturnValue([CardType.BBANG, CardType.SHIELD]);
    (updateCharacterFromRoom as jest.Mock).mockReturnValue(true);

    const result = cardMaturedSavingsEffect(roomId, userId);

    expect(result).toBe(true);
    expect(drawDeck).toHaveBeenCalledWith(roomId, 2);
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
    (getDeckSize as jest.Mock).mockReturnValue(10);
    (drawDeck as jest.Mock).mockReturnValue([CardType.BBANG, CardType.BBANG]);
    (updateCharacterFromRoom as jest.Mock).mockReturnValue(true);

    const result = cardMaturedSavingsEffect(roomId, userId);

    expect(result).toBe(true);
    const updatedUser = (updateCharacterFromRoom as jest.Mock).mock.calls[0][2];
    expect(updatedUser.handCards[0].count).toBe(3);
    expect(updatedUser.handCardsCount).toBe(3);
  });

  
  it('updateCharacterFromRoom 실패 시 false 반환', () => {
    (getUserFromRoom as jest.Mock).mockReturnValue(mockUser);
    (getDeckSize as jest.Mock).mockReturnValue(10);
    (drawDeck as jest.Mock).mockReturnValue([CardType.BBANG, CardType.SHIELD]);
    (updateCharacterFromRoom as jest.Mock).mockImplementation(() => {
      throw new Error('DB Error');
    });

    const result = cardMaturedSavingsEffect(roomId, userId);

    expect(result).toBe(false);
  });
});
