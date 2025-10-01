import { MaturedSavingsCard } from '../../card/class/card.matured.savings';
import { WinLotteryCard } from '../../card/class/card.win.lottery';
import { CardType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';

describe('MaturedSavingsCard', () => {
  let mockRoom: jest.Mocked<Room>;
  let mockUser: User;

  beforeEach(() => {
    mockRoom = {
      getDeckSize: jest.fn(),
      removeCard: jest.fn(),
      drawDeck: jest.fn(),
    } as unknown as jest.Mocked<Room>;

    mockUser = {
      id: 'user1',
      character: {
        handCards: [],
        handCardsCount: 0,
      },
    } as unknown as User;

    process.env.MATURED_SAVINGS_DRAW_COUNT = '2';
  });

  it('시나리오 1 : 만기적금 로직이 성공적으로 처리 되는지', () => {
    mockRoom.getDeckSize.mockReturnValue(5);
    mockRoom.drawDeck.mockReturnValue([CardType.BBANG, CardType.SHIELD]);

    const card = new MaturedSavingsCard();
    const result = card.useCard(mockRoom, mockUser);

    expect(result).toBe(true);
    expect(mockRoom.removeCard).toHaveBeenCalledWith(mockUser, CardType.MATURED_SAVINGS);
    expect(mockUser.character!.handCards.length).toBe(2); // 카드 종류도 2가지
    expect(mockUser.character!.handCardsCount).toBe(2); // 총 카드수도 2
  });

  it('시나리오 2 : 덱에 뽑을 카드 보다 남은 카드가 적을 경우 실패 처리', () => {
    mockRoom.getDeckSize.mockReturnValue(1);
    const card = new MaturedSavingsCard();
    expect(card.useCard(mockRoom, mockUser)).toBe(false);
  });

  it('시나리오 3 : 소지한 카드와 같은 카드를 뽑았을 경우 중복되는 카드는 카운트 증가 처리', () => {
    mockRoom.getDeckSize.mockReturnValue(5);
    mockRoom.drawDeck.mockReturnValue([CardType.BBANG, CardType.BIG_BBANG]);

    // 이미 같은 카드 보유
    mockUser.character!.handCards = [{ type: CardType.BIG_BBANG, count: 1 }];

    const card = new MaturedSavingsCard();
    const result = card.useCard(mockRoom, mockUser);
    
    expect(result).toBe(true);
    expect(mockRoom.removeCard).toHaveBeenCalledWith(mockUser, CardType.MATURED_SAVINGS);
    expect(mockUser.character!.handCards.length).toBe(2); // 카드 종류는 2가지
    expect(mockUser.character!.handCards[0].count).toBe(2); // 기존 1 + 새로 뽑은 1
    expect(mockUser.character!.handCardsCount).toBe(3); // 총 카드수도 3
  });
});



describe('WinLotteryCard', () => {
  let mockRoom: jest.Mocked<Room>;
  let mockUser: User;

  beforeEach(() => {
    mockRoom = {
      removeCard: jest.fn(),
      drawDeck: jest.fn(),
    } as unknown as jest.Mocked<Room>;

    mockUser = {
      id: 'user2',
      character: {
        handCards: [],
        handCardsCount: 0,
      },
    } as unknown as User;

    process.env.WIN_LOTTERY_DRAW = '3';
  });

  it('시나리오 1 : 복권 당첨 로직이 정상적으로 처리되는 지', () => {
    mockRoom.drawDeck.mockReturnValue([CardType.BBANG, CardType.BIG_BBANG, CardType.MATURED_SAVINGS]);
    const card = new WinLotteryCard();

    const result = card.useCard(mockRoom, mockUser);

    expect(result).toBe(true);
    expect(mockRoom.removeCard).toHaveBeenCalledWith(mockUser, CardType.WIN_LOTTERY);
    expect(mockUser.character!.handCards.length).toBe(3);
    expect(mockUser.character!.handCards.find(c => c.type === CardType.BBANG)!.count).toBe(1); // 각 카드 별로 1장씩 추가
    expect(mockUser.character!.handCards.find(c => c.type === CardType.BIG_BBANG)!.count).toBe(1);
    expect(mockUser.character!.handCards.find(c => c.type === CardType.MATURED_SAVINGS)!.count).toBe(1);
    expect(mockUser.character!.handCardsCount).toBe(3);
  });

  it('시나리오 2 : 덱에 뽑을 카드 보다 남은 카드가 적을 경우 실패 처리', () => {
    mockRoom.drawDeck.mockReturnValue([]);
    const card = new WinLotteryCard();
    expect(card.useCard(mockRoom, mockUser)).toBe(false);
  });

  it('시나리오 3 : 소지한 카드와 같은 카드를 뽑았을 경우 중복되는 카드는 카운트 증가 처리', () => {
    mockRoom.drawDeck.mockReturnValue([CardType.BIG_BBANG, CardType.BIG_BBANG, CardType.MATURED_SAVINGS]);
    const card = new WinLotteryCard();

    const result = card.useCard(mockRoom, mockUser);

    expect(result).toBe(true);
    expect(mockRoom.removeCard).toHaveBeenCalledWith(mockUser, CardType.WIN_LOTTERY);
    expect(mockUser.character!.handCards.length).toBe(2);
    expect(mockUser.character!.handCards.find(c => c.type === CardType.BIG_BBANG)!.count).toBe(2);
    expect(mockUser.character!.handCards.find(c => c.type === CardType.MATURED_SAVINGS)!.count).toBe(1);
    expect(mockUser.character!.handCardsCount).toBe(3);
  });
});
