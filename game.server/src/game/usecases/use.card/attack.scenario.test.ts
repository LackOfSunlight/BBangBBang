import {
	CardType,
	CharacterStateType,
	ReactionType,
	RoleType,
	CharacterType as CharType,
	RoomStateType,
	GlobalFailCode,
} from '@core/generated/common/enums';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import { useCardUseCase } from './use.card.usecase';
import { reactionUpdateUseCase } from '../reaction.update/reaction.update.usecase';
import roomManger from '@game/managers/room.manager';
import { GameSocket } from '@common/types/game.socket';
import { CharacterData } from '@core/generated/common/types';
import { BBangCard } from '@game/cards/card.bbang';
import { weaponDamageEffect } from '@game/config/weapon.init';
import { CheckGuerrillaService } from '@game/services/guerrilla.check.service';

// Mock managers and services
jest.mock('../../managers/room.manager');
jest.mock('../../services/guerrilla.check.service');

describe('뱅 카드 사용 시나리오 (재작성)', () => {
	let attacker: User;
	let target: User;
	let room: Room;
	let mockSocket: GameSocket;
	let originalMathRandom: () => number;

	// 테스트 환경을 설정하는 헬퍼 함수
	const setupTestEnvironment = (attackerHp = 4, targetHp = 4) => {
		const attackerCharacterData: CharacterData = {
			characterType: CharType.NONE_CHARACTER,
			roleType: RoleType.NONE_ROLE,
			hp: attackerHp,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.NONE_CHARACTER_STATE,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [{ type: CardType.BBANG, count: 1 }],
			bbangCount: 0,
			handCardsCount: 1,
		};

		const targetCharacterData: CharacterData = {
			characterType: CharType.NONE_CHARACTER,
			roleType: RoleType.NONE_ROLE,
			hp: targetHp,
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

		attacker = new User('attackerSocketId', '공격자');
		attacker.id = 'attackerId';
		attacker.setCharacter(attackerCharacterData);

		target = new User('targetSocketId', '타겟');
		target.id = 'targetId';
		target.setCharacter(targetCharacterData);

		room = new Room(1, attacker.id, '테스트룸', 8, RoomStateType.INGAME, []);
		room.addUserToRoom(attacker);
		room.addUserToRoom(target);

		// roomManager의 함수들을 모의 처리
		(roomManger.getRoom as jest.Mock).mockReturnValue(room);
		(roomManger.getUserFromRoom as jest.Mock).mockImplementation(
			(roomId: number, userId: string) => {
				if (userId === attacker.id) return attacker;
				if (userId === target.id) return target;
				return undefined;
			},
		);

		mockSocket = { userId: target.id, roomId: room.id } as GameSocket;
	};

	beforeEach(() => {
		setupTestEnvironment();
		// Math.random을 모의 처리하여 방어 로직이 발동하지 않도록 함
		originalMathRandom = Math.random;
		Math.random = () => 0.5;

		jest.spyOn(console, 'log').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
		// 테스트 후 Math.random을 원래대로 복구
		Math.random = originalMathRandom;
	});

	it('시나리오 1: 기본 공격 시, 타겟의 HP가 뱅 카드의 데미지만큼 감소한다.', () => {
		const initialHp = target.character!.hp;
		const damage = BBangCard.BBangDamage;

		const useCardResult = useCardUseCase(attacker.id, room.id, CardType.BBANG, target.id);
		expect(useCardResult.success).toBe(true);

		reactionUpdateUseCase(
			{ userId: target.id, roomId: room.id } as GameSocket,
			ReactionType.NONE_REACTION,
		);

		expect(target.character!.hp).toBe(initialHp - damage);
	});

	it('시나리오 2: 데저트 이글 장착 후 공격 시, 타겟의 HP가 뱅 데미지의 2배만큼 감소한다.', () => {
		const initialHp = target.character!.hp;
		attacker.character!.weapon = CardType.DESERT_EAGLE;
		const damage = weaponDamageEffect(BBangCard.BBangDamage, attacker.character!);

		const useCardResult = useCardUseCase(attacker.id, room.id, CardType.BBANG, target.id);
		expect(useCardResult.success).toBe(true);

		reactionUpdateUseCase(
			{ userId: target.id, roomId: room.id } as GameSocket,
			ReactionType.NONE_REACTION,
		);

		expect(target.character!.hp).toBe(initialHp - damage);
	});

	it('시나리오 3: 데스매치 중 공격 시, HP 변화 없이 상태만 이전된다.', () => {
		const initialAttackerHp = attacker.character!.hp;
		const initialTargetHp = target.character!.hp;
		// 설정: 공격자와 타겟을 데스매치 상태로 설정
		attacker.character!.stateInfo!.state = CharacterStateType.DEATH_MATCH_TURN_STATE;
		target.character!.stateInfo!.state = CharacterStateType.DEATH_MATCH_STATE;

		const useCardResult = useCardUseCase(attacker.id, room.id, CardType.BBANG, target.id);

		expect(useCardResult.success).toBe(true);
		// 상태 이전 확인
		expect(attacker.character!.stateInfo!.state).toBe(CharacterStateType.DEATH_MATCH_STATE);
		expect(target.character!.stateInfo!.state).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);
		// HP 변화 없는지 확인
		expect(attacker.character!.hp).toBe(initialAttackerHp);
		expect(target.character!.hp).toBe(initialTargetHp);
	});

	it('시나리오 4: 데스매치 턴에 뱅 카드를 내지 못하면, HP가 1 감소하고 데스매치가 종료된다.', async () => {
		// 설정: 공격자는 뱅 카드가 없고, 데스매치 턴 상태
		attacker.character!.handCards = [];
		attacker.character!.stateInfo = {
			state: CharacterStateType.DEATH_MATCH_TURN_STATE,
			stateTargetUserId: target.id,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: '0',
		};
		target.character!.stateInfo = {
			state: CharacterStateType.DEATH_MATCH_STATE,
			stateTargetUserId: attacker.id,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: '0',
		};

		const initialAttackerHp = attacker.character!.hp;

		// 실행: 공격자(현재 턴)가 아무런 반응을 하지 않음
		const reactionResult = await reactionUpdateUseCase(
			{ userId: attacker.id, roomId: room.id } as GameSocket,
			ReactionType.NONE_REACTION,
		);

		// 검증
		expect(reactionResult.success).toBe(true);
		// 1. 공격자의 HP가 1 감소했는지 확인
		expect(attacker.character!.hp).toBe(initialAttackerHp - 1);
		// 2. 양쪽 모두의 데스매치 상태가 종료되었는지 확인
		expect(attacker.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		expect(target.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
	});

	it('시나리오 5: 격리 상태인 대상을 공격 시, 카드 사용이 실패하고 대상의 HP는 변하지 않는다.', () => {
		const initialHp = target.character!.hp;
		const initialAttackerCardCount =
			attacker.character!.handCards.find((c) => c.type === CardType.BBANG)?.count ?? 0;
		target.character!.stateInfo!.state = CharacterStateType.CONTAINED;

		const useCardResult = useCardUseCase(attacker.id, room.id, CardType.BBANG, target.id);

		expect(useCardResult.success).toBe(false);
		expect(useCardResult.failcode).toBe(GlobalFailCode.INVALID_REQUEST);
		expect(target.character!.hp).toBe(initialHp);
		const finalAttackerCardCount =
			attacker.character!.handCards.find((c) => c.type === CardType.BBANG)?.count ?? 0;
		expect(finalAttackerCardCount).toBe(initialAttackerCardCount);
	});

	it('시나리오 6: 무차별 난사 사용 시, 타겟들의 상태가 BIG_BBANG_TARGET으로 변경된다.', () => {
		const anotherTarget = new User('anotherTargetSocketId', '추가타겟');
		anotherTarget.id = 'anotherTargetId';
		anotherTarget.setCharacter({
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
		});
		room.addUserToRoom(anotherTarget);

		(roomManger.getUserFromRoom as jest.Mock).mockImplementation(
			(roomId: number, userId: string) => {
				if (userId === attacker.id) return attacker;
				if (userId === target.id) return target;
				if (userId === anotherTarget.id) return anotherTarget;
				return undefined;
			},
		);

		attacker.character!.handCards = [{ type: CardType.BIG_BBANG, count: 1 }];

		const useCardResult = useCardUseCase(attacker.id, room.id, CardType.BIG_BBANG, '0');
		expect(useCardResult.success).toBe(true);

		expect(attacker.character!.stateInfo!.state).toBe(CharacterStateType.BIG_BBANG_SHOOTER);
		expect(target.character!.stateInfo!.state).toBe(CharacterStateType.BIG_BBANG_TARGET);
		expect(anotherTarget.character!.stateInfo!.state).toBe(CharacterStateType.BIG_BBANG_TARGET);
	});

	it('시나리오 7: 다른 유저가 행동 중일 때 무차별 난사 사용 시, 카드 사용이 실패한다.', () => {
		target.character!.stateInfo!.state = CharacterStateType.BBANG_TARGET;
		attacker.character!.handCards.push({ type: CardType.BIG_BBANG, count: 1 });
		const initialAttackerCards =
			attacker.character!.handCards.find((c) => c.type === CardType.BIG_BBANG)?.count ?? 0;

		const useCardResult = useCardUseCase(attacker.id, room.id, CardType.BIG_BBANG, '0');

		expect(useCardResult.success).toBe(false);

		const finalAttackerCards =
			attacker.character!.handCards.find((c) => c.type === CardType.BIG_BBANG)?.count ?? 0;
		expect(finalAttackerCards).toBe(initialAttackerCards);

		expect(attacker.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		expect(target.character!.stateInfo!.state).toBe(CharacterStateType.BBANG_TARGET);
	});

	it('시나리오 8: 게릴라 타겟 상태에서 뱅 사용 시, 상태가 초기화되고 게릴라 체크 서비스가 호출된다.', () => {
		attacker.character!.stateInfo!.state = CharacterStateType.GUERRILLA_TARGET;
		target.character!.stateInfo!.state = CharacterStateType.BBANG_SHOOTER;
		const initialTargetHp = target.character!.hp;

		const useCardResult = useCardUseCase(attacker.id, room.id, CardType.BBANG, target.id);

		expect(useCardResult.success).toBe(true);
		expect(attacker.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		expect(target.character!.hp).toBe(initialTargetHp);
		expect(CheckGuerrillaService).toHaveBeenCalledWith(room);
	});
});
