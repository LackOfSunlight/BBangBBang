import {
	CardType,
	CharacterStateType,
	RoleType,
	CharacterType as CharType,
	RoomStateType,
} from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { useCardUseCase } from './use.card.usecase';
import roomManger from '../../managers/room.manager';
import { CharacterData } from '../../generated/common/types';
import getMaxHp from '../../init/character.Init';

// Mock roomManger
jest.mock('../../managers/room.manager');

describe('회복 카드 시나리오 (백신, 119)', () => {
	let healer: User;
	let target: User;
	let anotherUser: User;
	let room: Room;

	// 테스트 환경을 설정하는 헬퍼 함수
	const setupTestEnvironment = (healerHp: number, targetHp?: number, anotherUserHp?: number) => {
		const healerCharacterData: CharacterData = {
			characterType: CharType.NONE_CHARACTER,
			roleType: RoleType.NONE_ROLE,
			hp: healerHp,
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

		healer = new User('healerSocketId', '힐러');
		healer.id = 'healerId';
		healer.setCharacter(healerCharacterData);

		room = new Room(1, healer.id, '테스트룸', 8, RoomStateType.INGAME, []);
		room.addUserToRoom(healer);

		if (targetHp !== undefined) {
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
			target = new User('targetSocketId', '타겟');
			target.id = 'targetId';
			target.setCharacter(targetCharacterData);
			room.addUserToRoom(target);
		}

		if (anotherUserHp !== undefined) {
			const anotherUserCharacterData: CharacterData = {
				characterType: CharType.NONE_CHARACTER,
				roleType: RoleType.NONE_ROLE,
				hp: anotherUserHp,
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
			anotherUser = new User('anotherUserSocketId', '다른유저');
			anotherUser.id = 'anotherUserId';
			anotherUser.setCharacter(anotherUserCharacterData);
			room.addUserToRoom(anotherUser);
		}

		// roomManager의 함수들을 모의 처리
		(roomManger.getRoom as jest.Mock).mockReturnValue(room);
		(roomManger.getUserFromRoom as jest.Mock).mockImplementation(
			(roomId: number, userId: string) => {
				return room.users.find((u) => u.id === userId);
			},
		);
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('백신 카드', () => {
		it('HP가 최대치가 아닐 때 사용하면 HP가 1 증가한다.', () => {
			const maxHp = getMaxHp(CharType.NONE_CHARACTER);
			setupTestEnvironment(maxHp - 1);
			healer.character!.handCards.push({ type: CardType.VACCINE, count: 1 });

			const useCardResult = useCardUseCase(healer.id, room.id, CardType.VACCINE, '0');

			expect(useCardResult.success).toBe(true);
			expect(healer.character!.hp).toBe(maxHp);
			expect(healer.character!.handCards.some((c) => c.type === CardType.VACCINE)).toBe(false);
		});

		it('HP가 최대치일 때 사용하면 실패한다.', () => {
			const maxHp = getMaxHp(CharType.NONE_CHARACTER);
			setupTestEnvironment(maxHp);
			healer.character!.handCards.push({ type: CardType.VACCINE, count: 1 });
			const initialCardCount =
				healer.character!.handCards.find((c) => c.type === CardType.VACCINE)?.count ?? 0;

			const useCardResult = useCardUseCase(healer.id, room.id, CardType.VACCINE, '0');

			expect(useCardResult.success).toBe(false);
			expect(healer.character!.hp).toBe(maxHp);
			const finalCardCount =
				healer.character!.handCards.find((c) => c.type === CardType.VACCINE)?.count ?? 0;
			expect(finalCardCount).toBe(initialCardCount);
		});
	});

	describe('119 호출 카드', () => {
		it('자신을 대상으로 사용 시, 자신의 HP가 1 증가한다.', () => {
			const maxHp = getMaxHp(CharType.NONE_CHARACTER);
			setupTestEnvironment(maxHp - 1);
			healer.character!.handCards.push({ type: CardType.CALL_119, count: 1 });

			const useCardResult = useCardUseCase(healer.id, room.id, CardType.CALL_119, healer.id);

			expect(useCardResult.success).toBe(true);
			expect(healer.character!.hp).toBe(maxHp);
			expect(healer.character!.handCards.some((c) => c.type === CardType.CALL_119)).toBe(false);
		});

		it('자신의 HP가 최대치일 때 사용하면 실패한다.', () => {
			const maxHp = getMaxHp(CharType.NONE_CHARACTER);
			setupTestEnvironment(maxHp, maxHp - 1);
			healer.character!.handCards.push({ type: CardType.CALL_119, count: 1 });
			const initialCardCount =
				healer.character!.handCards.find((c) => c.type === CardType.CALL_119)?.count ?? 0;

			const useCardResult = useCardUseCase(healer.id, room.id, CardType.CALL_119, target.id);

			expect(useCardResult.success).toBe(false);
			expect(healer.character!.hp).toBe(maxHp);
			const finalCardCount =
				healer.character!.handCards.find((c) => c.type === CardType.CALL_119)?.count ?? 0;
			expect(finalCardCount).toBe(initialCardCount);
		});

		it('전체 회복 시, 자신을 제외한 모든 유저의 HP가 1 증가한다.', () => {
			const maxHp = getMaxHp(CharType.NONE_CHARACTER);
			setupTestEnvironment(maxHp, maxHp - 2, maxHp - 1);
			healer.character!.handCards.push({ type: CardType.CALL_119, count: 1 });

			const useCardResult = useCardUseCase(healer.id, room.id, CardType.CALL_119, '0');

			expect(useCardResult.success).toBe(true);
			expect(healer.character!.hp).toBe(maxHp);
			expect(target.character!.hp).toBe(maxHp - 1);
			expect(anotherUser.character!.hp).toBe(maxHp);
			expect(healer.character!.handCards.some((c) => c.type === CardType.CALL_119)).toBe(false);
		});

		it('전체 회복 시, 모든 타겟이 최대 HP이면 실패한다.', () => {
			const maxHp = getMaxHp(CharType.NONE_CHARACTER);
			setupTestEnvironment(maxHp - 2, maxHp, maxHp);
			healer.character!.handCards.push({ type: CardType.CALL_119, count: 1 });
			const initialCardCount =
				healer.character!.handCards.find((c) => c.type === CardType.CALL_119)?.count ?? 0;

			const useCardResult = useCardUseCase(healer.id, room.id, CardType.CALL_119, '0');

			expect(useCardResult.success).toBe(false);
			expect(healer.character!.hp).toBe(maxHp - 2);
			expect(target.character!.hp).toBe(maxHp);
			expect(anotherUser.character!.hp).toBe(maxHp);
			const finalCardCount =
				healer.character!.handCards.find((c) => c.type === CardType.CALL_119)?.count ?? 0;
			expect(finalCardCount).toBe(initialCardCount);
		});
	});
});
