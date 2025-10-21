import { ContainmentUnitCard } from '@game/cards/card.containment.unit';
import { CardType, CharacterStateType } from '@core/generated/common/enums';
import { CardCategory } from '@game/enums/card.category';
import roomManager from '@game/managers/room.manager';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';

jest.mock('../../managers/room.manager');

describe('ContainmentUnitCard', () => {
  let card: ContainmentUnitCard;
  let room: Room;
  let user: User;
  let target: User;

  beforeEach(() => {
    card = new ContainmentUnitCard();

    user = {
      nickname: 'user',
      character: {
        stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
        debuffs: [],
        removeHandCard: jest.fn(),
      },
    } as unknown as User;

    target = {
      nickname: 'target',
      character: {
        stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
        debuffs: [],
        removeHandCard: jest.fn(),
      },
    } as unknown as User;

    room = {
      id: 1,
      users: [user, target],
      repeatDeck: jest.fn(),
    } as unknown as Room;

    (roomManager.getRoom as jest.Mock).mockReturnValue(room);
  });

  describe('useCard', () => {
    it('시나리오 1 : useCard 로직이 정상적으로 처리되는지 확인', () => {
      const result = card.useCard(room, user, target);

      expect(result).toBe(true);
      expect(user.character!.removeHandCard).toHaveBeenCalledWith(CardType.CONTAINMENT_UNIT);
      expect(target.character!.debuffs).toContain(CardType.CONTAINMENT_UNIT);
    });

    it('시나리오 2 : 이미 디버프가 있는 경우 실패', () => {
      target.character!.debuffs = [CardType.CONTAINMENT_UNIT];

      const result = card.useCard(room, user, target);

      expect(result).toBe(false);
    });
  });

  describe('onNewDay', () => {
    it('시나리오 3 : checkContainmentUnitTarget을 정상적으로 호출', async () => {
      const spy = jest.spyOn(card, 'checkContainmentUnitTarget');
      await card.onNewDay(room);
      expect(spy).toHaveBeenCalledWith(room.id);
    });
  });

  describe('checkContainmentUnitTarget', () => {
    it('시나리오 4 : 디버프 유저들을 찾아서 효과를 적용', () => {
      target.character!.debuffs = [CardType.CONTAINMENT_UNIT];

      const spy = jest.spyOn(card, 'debuffContainmentUnitEffect');
      card.checkContainmentUnitTarget(room.id);

      expect(spy).toHaveBeenCalledWith(room, target);
    });
  });

  describe('debuffContainmentUnitEffect', () => {
    it('시나리오 5 : 첫날이면 상태를 CONTAINED로 변경', () => {
      target.character!.debuffs = [CardType.CONTAINMENT_UNIT];
      target.character!.stateInfo.state = CharacterStateType.NONE_CHARACTER_STATE;

      card.debuffContainmentUnitEffect(room, target);

      expect(target.character!.stateInfo.state).toBe(CharacterStateType.CONTAINED);
    });

    it('시나리오 6 : 확률에 따라 탈출 성공하면 디버프 제거', () => {
      target.character!.debuffs = [CardType.CONTAINMENT_UNIT];
      target.character!.stateInfo.state = CharacterStateType.CONTAINED;

      jest.spyOn(global.Math, 'random').mockReturnValue(0.1); // 10 < 50 -> 성공

      card.debuffContainmentUnitEffect(room, target);

      expect(target.character!.stateInfo.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
      expect(target.character!.debuffs).not.toContain(CardType.CONTAINMENT_UNIT);
      expect(room.repeatDeck).toHaveBeenCalledWith([CardType.CONTAINMENT_UNIT]);

      (Math.random as jest.Mock).mockRestore();
    });

    it('시나리오 7 : 확률 실패 시 상태 변화 없음', () => {
      target.character!.debuffs = [CardType.CONTAINMENT_UNIT];
      target.character!.stateInfo.state = CharacterStateType.CONTAINED;

      jest.spyOn(global.Math, 'random').mockReturnValue(0.9); // 90 > 50 -> 실패

      card.debuffContainmentUnitEffect(room, target);

      expect(target.character!.stateInfo.state).toBe(CharacterStateType.CONTAINED);
      expect(target.character!.debuffs).toContain(CardType.CONTAINMENT_UNIT);

      (Math.random as jest.Mock).mockRestore();
    });
  });
});
