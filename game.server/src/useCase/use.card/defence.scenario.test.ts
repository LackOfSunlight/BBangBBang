import {
	CardType,
	CharacterStateType,
	ReactionType,
	RoleType,
	CharacterType as CharType,
	RoomStateType,
} from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { useCardUseCase } from './use.card.usecase';
import { reactionUpdateUseCase } from '../reaction.update/reaction.update.usecase';
import roomManger from '../../managers/room.manager';
import { GameSocket } from '../../type/game.socket';
import { CharacterData } from '../../generated/common/types';
import { cardPool } from '../../dispatcher/apply.card.dispacher';
import { ShieldCard } from '../../card/class/card.shield';

// Mock managers and services
jest.mock('../../managers/room.manager');
jest.mock('../../services/bigbbang.check.service', () => ({
	CheckBigBbangService: jest.fn((room) => room),
}));

describe('쉴드 카드 및 방어 시나리오 (최종 수정)', () => {
	let attacker: User;
	let target: User;
	let room: Room;
	let originalMathRandom: () => number;

	// 기본 테스트 환경 설정 (캐릭터는 기본값)
	const setupTestEnvironment = () => {
		const attackerCharacterData: CharacterData = {
			characterType: CharType.NONE_CHARACTER,
			roleType: RoleType.NONE_ROLE,
			hp: 4,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.NONE_CHARACTER_STATE,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [
				{ type: CardType.BBANG, count: 1 },
				{ type: CardType.BIG_BBANG, count: 1 },
			],
			bbangCount: 0,
			handCardsCount: 2,
		};

		const targetCharacterData: CharacterData = {
			characterType: CharType.NONE_CHARACTER,
			roleType: RoleType.NONE_ROLE,
			hp: 4,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.NONE_CHARACTER_STATE,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		};

		attacker = new User('attackerId', '공격자');
		attacker.setCharacter(attackerCharacterData);

		target = new User('targetId', '타겟');
		target.setCharacter(targetCharacterData);

		room = new Room(1, attacker.id, '테스트룸', 8, RoomStateType.INGAME, [attacker, target]);

		(roomManger.getRoom as jest.Mock).mockReturnValue(room);
		(roomManger.getUserFromRoom as jest.Mock).mockImplementation((_, userId) =>
			userId === attacker.id ? attacker : target,
		);
	};

	beforeEach(() => {
		setupTestEnvironment();
		cardPool.clear();
		originalMathRandom = Math.random;
		Math.random = () => 0.5;
		jest.spyOn(console, 'log').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
		Math.random = originalMathRandom;
	});

	it('시나리오 1: 기본 뱅 공격을 쉴드 1장으로 방어한다.', () => {
		const shieldCard = new ShieldCard();
		const requiredShields = shieldCard.requiredShieldCount(attacker);
		target.character!.handCards.push({ type: CardType.SHIELD, count: requiredShields });
		expect(requiredShields).toBe(1);

		const initialHp = target.character!.hp;

		useCardUseCase(attacker.id, room.id, CardType.BBANG, target.id);
		const shieldResult = useCardUseCase(target.id, room.id, CardType.SHIELD, attacker.id);

		expect(shieldResult.success).toBe(true);
		expect(target.character!.hp).toBe(initialHp);
		expect(target.character!.handCards.some((c) => c.type === CardType.SHIELD)).toBe(false);
	});

	it('시나리오 2: 상어의 뱅 공격을 필요한 쉴드 개수(2장)만큼 소모하여 방어한다.', () => {
		process.env.SHARK_REQUIRED_SHELD = '2';
		const shieldCard = new ShieldCard();
		attacker.character!.characterType = CharType.SHARK;
		const requiredShields = shieldCard.requiredShieldCount(attacker);
		target.character!.handCards.push({ type: CardType.SHIELD, count: requiredShields });
		expect(requiredShields).toBe(2);

		const initialHp = target.character!.hp;

		useCardUseCase(attacker.id, room.id, CardType.BBANG, target.id);
		const shieldResult = useCardUseCase(target.id, room.id, CardType.SHIELD, attacker.id);

		expect(shieldResult.success).toBe(true);
		expect(target.character!.hp).toBe(initialHp);
		expect(requiredShields).toBe(2);
		expect(target.character!.handCards.some((c) => c.type === CardType.SHIELD)).toBe(false);
	});

	it('시나리오 3: 레이저 포인터 뱅 공격을 필요한 쉴드 개수(2장)만큼 소모하여 방어한다.', () => {
		process.env.LASER_REQUIRED_SHELD = '2';
		const shieldCard = new ShieldCard();
		attacker.character!.equips.push(CardType.LASER_POINTER);
		const requiredShields = shieldCard.requiredShieldCount(attacker);
		target.character!.handCards.push({ type: CardType.SHIELD, count: requiredShields });
		expect(requiredShields).toBe(2);

		const initialHp = target.character!.hp;

		useCardUseCase(attacker.id, room.id, CardType.BBANG, target.id);
		const shieldResult = useCardUseCase(target.id, room.id, CardType.SHIELD, attacker.id);

		expect(shieldResult.success).toBe(true);
		expect(target.character!.hp).toBe(initialHp);
		expect(requiredShields).toBe(2);
		expect(target.character!.handCards.some((c) => c.type === CardType.SHIELD)).toBe(false);
	});

	it('시나리오 4: 무차별 난사 공격을 쉴드 1장으로 방어한다.', () => {
		const shieldCard = new ShieldCard();
		const requiredShields = shieldCard.requiredShieldCount(attacker);
		target.character!.handCards.push({ type: CardType.SHIELD, count: requiredShields });
		expect(requiredShields).toBe(1);
		const initialHp = target.character!.hp;

		useCardUseCase(attacker.id, room.id, CardType.BIG_BBANG, '0');
		const shieldResult = useCardUseCase(target.id, room.id, CardType.SHIELD, attacker.id);

		expect(shieldResult.success).toBe(true);
		expect(target.character!.hp).toBe(initialHp);
		expect(target.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		expect(target.character!.handCards.some((c) => c.type === CardType.SHIELD)).toBe(false);
	});

	it('시나리오 5: 자동 쉴드로 뱅 공격을 방어한다.', () => {
		target.character!.equips.push(CardType.AUTO_SHIELD);
		const initialHp = target.character!.hp;
		Math.random = () => 0.1; // 25% 확률 방어 성공하도록 조작

		useCardUseCase(attacker.id, room.id, CardType.BBANG, target.id);
		reactionUpdateUseCase(
			{ userId: target.id, roomId: room.id } as GameSocket,
			ReactionType.NONE_REACTION,
		);

		expect(target.character!.hp).toBe(initialHp);
	});

	it('시나리오 6: 상어+레이저포인터 공격을 필요한 쉴드 개수(4장)만큼 소모하여 방어한다.', () => {
		process.env.SYNERGY_REQUIRED_SHELD = '4';
		const shieldCard = new ShieldCard();
		attacker.character!.characterType = CharType.SHARK;
		attacker.character!.equips.push(CardType.LASER_POINTER);
		const requiredShields = shieldCard.requiredShieldCount(attacker);
		target.character!.handCards.push({ type: CardType.SHIELD, count: requiredShields });
		expect(requiredShields).toBe(4);
		const initialHp = target.character!.hp;

		useCardUseCase(attacker.id, room.id, CardType.BBANG, target.id);
		const shieldResult = useCardUseCase(target.id, room.id, CardType.SHIELD, attacker.id);

		expect(shieldResult.success).toBe(true);
		expect(target.character!.hp).toBe(initialHp);
		expect(requiredShields).toBe(4);
		expect(target.character!.handCards.some((c) => c.type === CardType.SHIELD)).toBe(false);
	});

	it('시나리오 7: 개굴군 캐릭터는 25% 확률로 뱅 공격을 회피한다.', () => {
		target.character!.characterType = CharType.FROGGY;
		const initialHp = target.character!.hp;
		Math.random = () => 0.1; // 25% 확률 회피 성공하도록 조작

		useCardUseCase(attacker.id, room.id, CardType.BBANG, target.id);
		reactionUpdateUseCase(
			{ userId: target.id, roomId: room.id } as GameSocket,
			ReactionType.NONE_REACTION,
		);

		expect(target.character!.hp).toBe(initialHp);
	});
});
