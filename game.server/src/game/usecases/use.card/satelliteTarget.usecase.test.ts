import { CardType, CharacterStateType, RoomStateType } from '@core/generated/common/enums';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import { useCardUseCase } from './use.card.usecase';
import roomManger from '@game/managers/room.manager';
import { Card } from '@game/models/card.model';

jest.mock('../../managers/room.manager');

describe('위성 타겟 카드 인게임 시나리오', () => {
    let room: Room;
    let caster: User;
    let target: User;
    let another: User;

    const setup = () => {
        caster = new User('casterSocket', '시전자');
        caster.id = 'caster';
        caster.setCharacter({
            characterType: 0,
            roleType: 0,
            hp: 4,
            weapon: 0,
            stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE, nextState: CharacterStateType.NONE_CHARACTER_STATE, nextStateAt: '0', stateTargetUserId: '0' },
            equips: [],
            debuffs: [],
            handCards: [{ type: CardType.SATELLITE_TARGET, count: 1 }],
            bbangCount: 0,
            handCardsCount: 1,
        });

        target = new User('targetSocket', '타겟');
        target.id = 'target';
        target.setCharacter({
            characterType: 0,
            roleType: 0,
            hp: 4,
            weapon: 0,
            stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE, nextState: CharacterStateType.NONE_CHARACTER_STATE, nextStateAt: '0', stateTargetUserId: '0' },
            equips: [],
            debuffs: [],
            handCards: [],
            bbangCount: 0,
            handCardsCount: 0,
        });

        another = new User('anotherSocket', '다른유저');
        another.id = 'another';
        another.setCharacter({
            characterType: 0,
            roleType: 0,
            hp: 4,
            weapon: 0,
            stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE, nextState: CharacterStateType.NONE_CHARACTER_STATE, nextStateAt: '0', stateTargetUserId: '0' },
            equips: [],
            debuffs: [],
            handCards: [],
            bbangCount: 0,
            handCardsCount: 0,
        });

        room = new Room(1, caster.id, '위성룸', 8, RoomStateType.INGAME, []);
        room.addUserToRoom(caster);
        room.addUserToRoom(target);
        room.addUserToRoom(another);

        (roomManger.getRoom as jest.Mock).mockReturnValue(room);
        (roomManger.getUserFromRoom as jest.Mock).mockImplementation((roomId: number, uid: string) => {
            return room.users.find((u) => u.id === uid);
        });
    };

    beforeEach(() => {
        setup();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('시나리오 1: 시전자가 대상에게 위성 타겟을 적용하면 대상의 디버프에 추가된다.', () => {
        const res = useCardUseCase(caster.id, room.id, CardType.SATELLITE_TARGET, target.id);
        expect(res.success).toBe(true);
        expect(target.character!.debuffs).toContain(CardType.SATELLITE_TARGET);
        // 손에서 카드가 제거되는지 (useCard 내부 removeHandCard 호출)
        const inHand = caster.character!.handCards.find((c) => c.type === CardType.SATELLITE_TARGET);
        expect(inHand).toBeUndefined();
    });

    it('시나리오 2: 이미 위성 타겟이 있는 대상에게 다시 사용해도 중복 추가되지 않는다.', () => {
        target.character!.debuffs.push(CardType.SATELLITE_TARGET);
        const initialLen = target.character!.debuffs.length;
        const res = useCardUseCase(caster.id, room.id, CardType.SATELLITE_TARGET, target.id);
        expect(res.success).toBe(true);
        expect(target.character!.debuffs.length).toBe(initialLen);
    });

    it('시나리오 3: 번개 미발동이면 디버프가 다음 살아있는 유저에게 이동한다.', async () => {
        // 카드 적용
        useCardUseCase(caster.id, room.id, CardType.SATELLITE_TARGET, target.id);

        // 확률 0%로 만들어 미발동 강제
        const originalRandom = Math.random;
        Math.random = () => 1; // 항상 실패

        const card = Card.createCard(CardType.SATELLITE_TARGET);
        await (card as any).checkSatelliteTargetEffect(room);

        // target에서 제거되고 another에게 추가되었는지
        expect(target.character!.debuffs).not.toContain(CardType.SATELLITE_TARGET);
        expect(another.character!.debuffs).toContain(CardType.SATELLITE_TARGET);

        Math.random = originalRandom;
    });

    it('시나리오 4: 효과 체크 시 번개 발동이면 대상이 피해를 받고 디버프가 제거된다.', async () => {
        // 카드 적용
        useCardUseCase(caster.id, room.id, CardType.SATELLITE_TARGET, target.id);

        const initialHp = target.character!.hp;

        // 확률 100%로 만들어 발동 강제
        const originalRandom = Math.random;
        Math.random = () => 0; // 항상 성공 (0 < 0.03)

        // 타이머 대기 시간을 빠르게 넘기기 위해 setTimeout을 즉시 실행으로 모킹하는 대신, 실제 코드 2초 대기
        // 테스트 시간을 고려해 여기서는 실제 대기를 유지하되, 필요시 jest.useFakeTimers()로 개선 가능
        const card = Card.createCard(CardType.SATELLITE_TARGET);
        await (card as any).checkSatelliteTargetEffect(room);

        expect(target.character!.hp).toBeLessThan(initialHp);
        expect(target.character!.debuffs).not.toContain(CardType.SATELLITE_TARGET);

        Math.random = originalRandom;
    });

	it('시나리오 5: 다음 대상이 사망 상태면 건너뛰고 그 다음 살아있는 유저에게 전달된다.', async () => {
		// 카드 적용: target이 디버프 보유
		useCardUseCase(caster.id, room.id, CardType.SATELLITE_TARGET, target.id);

		// another는 사망 처리
		another.character!.hp = 0;

		// 확률 0%로 만들어 미발동 강제 → 디버프 패스 로직 실행
		const originalRandom = Math.random;
		Math.random = () => 1; // 항상 실패(미발동)

		const card = Card.createCard(CardType.SATELLITE_TARGET);
		await (card as any).checkSatelliteTargetEffect(room);

		// target에서 제거되었고, 사망한 another는 건너뛰고 caster에게 전달되었는지 확인
		expect(target.character!.debuffs).not.toContain(CardType.SATELLITE_TARGET);
		expect(another.character!.debuffs).not.toContain(CardType.SATELLITE_TARGET);
		expect(caster.character!.debuffs).toContain(CardType.SATELLITE_TARGET);

		Math.random = originalRandom;
	});
});


