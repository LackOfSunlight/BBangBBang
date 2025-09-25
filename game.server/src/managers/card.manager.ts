import cardData from '../data/card.data.json';
import { CardData } from '../generated/common/types';
import { CardType } from '../generated/common/enums';

/**
 * 카드 매니저입니다.
 * 방별 덱 관리, 카드 드로우, 카드 소비 등의 기능을 담당합니다.
 */
class CardManager {
  private static instance: CardManager;

  // 방별 덱 저장소
  public roomDecks = new Map<number, CardType[]>();
  // 방별 플리마켓 카드 저장소
  public roomFleaMarketCards = new Map<number, CardType[]>();
  // 방별 플리마켓 선택 인덱스 저장소
  public fleaMarketPickIndex = new Map<number, number[]>();

  private constructor() {}

  public static getInstance(): CardManager {
    if (!CardManager.instance) {
      CardManager.instance = new CardManager();
    }
    return CardManager.instance;
  }

  /**
   * 방의 덱을 초기화합니다.
   * 카드 데이터를 기반으로 덱을 생성하고 섞습니다.
   */
  public initializeDeck(roomId: number): void {
    const deck: CardType[] = [];
    const cardDefinitions: CardData[] = (cardData as any[]).map((card) => ({
      ...card,
      type: CardType[card.type as keyof typeof CardType],
    }));

    cardDefinitions.forEach((cardDef) => {
      // 카드 정의의 count만큼 해당 타입의 카드를 덱에 추가
      for (let i = 0; i < cardDef.count; i++) {
        deck.push(cardDef.type);
      }
    });

    this.roomDecks.set(roomId, deck);
    this.shuffleDeck(roomId);
  }

  /**
   * 덱을 섞습니다.
   */
  public shuffleDeck(roomId: number): void {
    const deck = this.roomDecks.get(roomId);

    if (deck) {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    }
  }

  /**
   * 덱에서 카드를 드로우합니다.
   */
  public drawDeck(roomId: number, count: number): CardType[] {
    const deck = this.roomDecks.get(roomId);

    if (deck) {
      if (count > deck.length) {
        count = deck.length;
      }
      return deck.splice(0, count);
    } else {
      return [];
    }
  }

  /**
   * 카드를 덱에 다시 추가합니다.
   */
  public repeatDeck(roomId: number, cards: CardType[]): void {
    const deck = this.roomDecks.get(roomId);
    if (deck) deck.push(...cards);
  }

  /**
   * 덱 크기를 반환합니다.
   */
  public getDeckSize(roomId: number): number {
    const deck = this.roomDecks.get(roomId);
    if (deck) return deck.length;
    else return 0;
  }

  /**
   * 특정 카드를 덱에서 찾아 제거하고 반환합니다.
   */
  public drawSpecificCard(roomId: number, cardType: CardType): CardType | null {
    const deck = this.roomDecks.get(roomId);
    if (!deck) return null;

    // 카드 위치 찾기
    const index = deck.findIndex((c) => c === cardType);
    if (index === -1) return null;

    // 해당 카드를 덱에서 제거 후 반환
    return deck.splice(index, 1)[0];
  }

  /**
   * 사용자에게 카드를 추가합니다.
   * TODO: 카드 추가 시 유효성 검증 로직 추가 필요
   * TODO: 카드 추가 시 알림 패킷 생성 및 전송 필요
   */
  public addCardToUser(user: any, cardType: CardType): void {
    if (!user.character) {
      return;
    }
    
    const cardInHand = user.character.handCards.find((c: any) => c.type === cardType);
    if (cardInHand) {
      cardInHand.count++;
    } else {
      user.character.handCards.push({ type: cardType, count: 1 });
    }
    user.character.handCardsCount = user.character.handCards.reduce((sum: number, card: any) => sum + card.count, 0);
  }

  /**
   * 사용자로부터 카드를 제거하고 덱에 반환합니다.
   * TODO: 카드 제거 시 유효성 검증 로직 강화 필요
   * TODO: 카드 제거 시 알림 패킷 생성 및 전송 필요
   */
  public removeCard(user: any, room: any, cardType: CardType): void {
    const usedCard = user.character!.handCards.find((c: any) => c.type === cardType);

    if (usedCard != undefined) {
      usedCard.count -= 1;
      this.repeatDeck(room.id, [cardType]);

      if (usedCard.count <= 0) {
        user.character!.handCards = user.character!.handCards.filter((c: any) => c.count > 0);
        user.character!.handCardsCount = user.character!.handCards.reduce(
          (sum: number, card: any) => sum + card.count,
          0,
        );
      }
    } else {
      console.log('해당 카드를 소유하고 있지 않습니다.');
    }
  }
}

export const cardManager = CardManager.getInstance();