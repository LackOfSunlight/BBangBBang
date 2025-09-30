import { MaturedSavingsCard } from '../class/card.matured.savings';
import { CardCategory } from '../../enums/card.category';
import { CardType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

describe('MaturedSavingsCard', () => {
  let card: MaturedSavingsCard;
  let mockRoom: jest.Mocked<Room>;
  let mockUser: User;

  beforeEach(() => {
    process.env.MATURED_SAVINGS_DRAW_COUNT = '2';
    card = new MaturedSavingsCard();

    mockRoom = {
      getDeckSize: jest.fn(),
      removeCard: jest.fn(),
      drawDeck: jest.fn(),
    } as any;

    mockUser = {
      id: 'test-user',
      character: {
        handCards: [],
        handCardsCount: 0,
      },
    } as any;
  });

  it('시나리오 1 : 로직이 정상적으로 처리되는지', () => {
    mockRoom.getDeckSize.mockReturnValue(5);
    mockRoom.drawDeck.mockReturnValue([CardType.BIG_BBANG, CardType.MATURED_SAVINGS]);

    const result = card.useCard(mockRoom, mockUser);

    expect(result).toBe(true);
    expect(mockRoom.removeCard).toHaveBeenCalledWith(mockUser, CardType.MATURED_SAVINGS);
    expect(mockRoom.drawDeck).toHaveBeenCalledWith(2);
    expect(mockUser.character?.handCards.length).toBe(2);
    expect(mockUser.character?.handCardsCount).toBe(2);
  });

  it('시나리오 2 : 덱에 카드가 뽑아야할 카드보다 부족하다면 실패 처리', () => {
    mockRoom.getDeckSize.mockReturnValue(1); // 덱매수 1장 ; 2장보다 부족하게
    const result = card.useCard(mockRoom, mockUser);
    expect(result).toBe(false);
  });

  it('시나리오 3 : 이미 소지중인 카드를 뽑는다면 해당 카드의 카운트가 증가하는지 ', () => {
    mockRoom.getDeckSize.mockReturnValue(5);
    mockRoom.drawDeck.mockReturnValue([CardType.BBANG, CardType.BIG_BBANG]); 

    // 이미 같은 카드 보유
    mockUser.character!.handCards = [{ type: CardType.BIG_BBANG, count: 1 }];

    const result = card.useCard(mockRoom, mockUser);

    expect(result).toBe(true);
    expect(mockUser.character?.handCards.length).toBe(2); // 2종류의 카드를 보유하게 된지
    expect(mockUser.character?.handCards[0].count).toBe(2); // 기존 1 + 새로 뽑은 1
    expect(mockUser.character?.handCardsCount).toBe(3); // 전체 카드 매수 3
  });
});
