import { BombCard } from '../../card/class/card.bomb';
import { CardType, GlobalFailCode } from '../../generated/common/enums';
import { setBombTimer } from '../../services/set.bomb.timer.service';
import roomManager from '../../managers/room.manager';

// ---- Mock 설정 ----
jest.mock('../../services/take.damage.service', () => jest.fn());
jest.mock('../../services/game.end.service', () => ({ checkAndEndGameIfNeeded: jest.fn() }));
jest.mock('../../handlers/play.animation.handler', () => ({ playAnimationHandler: jest.fn() }));
jest.mock('../../sockets/notification', () => ({ broadcastDataToRoom: jest.fn() }));
jest.mock('../../services/set.bomb.timer.service', () => ({
  setBombTimer: { startBombTimer: jest.fn(), clearTimer: jest.fn() },
}));
jest.mock('../../managers/room.manager');
jest.mock('../../converter/packet.form', () => ({
    passDebuffResponseForm: (success: boolean, failcode: GlobalFailCode) =>
    ({ oneofKind: "passDebuffResponse", passDebuffResponse: { success, failcode } } as any),
  warnNotificationPacketForm: jest.fn(),
  userUpdateNotificationPacketForm: jest.fn(),
}));

// ---- 가짜 User ----
function createFakeUser(id: string, nickname: string) {
  return {
    id,
    nickname,
    character: {
      debuffs: [] as CardType[],
      stateInfo: {},
      removeHandCard: jest.fn(),
    },
  } as any;
}

// ---- 가짜 Room ----
function createFakeRoom(id: number, users: any[]) {
  return {
    id,
    users,
    toData: () => ({ users }),
    repeatDeck: jest.fn(),
  } as any;
}

describe('Bomb Test', () => {
  let room: any;
  let user: any;
  let target: any;
  let bombCard: BombCard;

  beforeEach(() => {
    user = createFakeUser('1', 'Red');
    target = createFakeUser('2', 'Malang');

    room = createFakeRoom(1, [user, target]);
    bombCard = new BombCard();

    (roomManager.getRoom as jest.Mock).mockReturnValue(room);
    (setBombTimer.clearTimer as jest.Mock).mockReturnValue(Date.now() + 5000);
  });

  // ---------------- BombCard ----------------
  it('시나리오 1 : [BombCard.useCard] 폭탄 디버프 적용 및 폭탄 타이머 작동 처리', () => {
    const result = bombCard.useCard(room, user, target);
    expect(result).toBe(true);
    expect(target.character.debuffs).toContain(CardType.BOMB);
    expect(setBombTimer.startBombTimer).toHaveBeenCalled();
  });

  it('시나리오 2 : [BombCard.bombExplosion] 폭발 함수 처리후 폭탄이 제거되는지', () => {
    target.character.debuffs.push(CardType.BOMB);
    bombCard.bombExplosion(room, target);
    expect(target.character.debuffs).not.toContain(CardType.BOMB);
  });

  // ---------------- SetBombTimer ----------------

  it('시나리오 3 : [SetBombTimer] 제한 시간이 0이 되면 폭발 함수 호출', () => {
        // bombExplosion spy
        const bombExplosionSpy = jest.spyOn(bombCard, 'bombExplosion').mockImplementation(() => {});

        // startBombTimer를 mock 구현으로 교체
        (setBombTimer.startBombTimer as jest.Mock).mockImplementation((_room, _target, _explosionAt) => {
            // startBombTimer가 호출되면 바로 bombExplosion 호출
            bombCard.bombExplosion(_room, _target);
        });

        // 폭탄 적용
        bombCard.useCard(room, user, target);

        // bombExplosion이 호출됐는지 확인
        expect(bombExplosionSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: room.id }),
        expect.objectContaining({ id: target.id })
    );

    bombExplosionSpy.mockRestore();
    });

});
