import {
	CardType,
	CharacterStateType,
	RoleType,
	CharacterType as CharType,
	RoomStateType,
	SelectCardType,
} from '@core/generated/common/enums';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import { useCardUseCase } from './use.card.usecase';
import roomManger from '@game/managers/room.manager';
import { CharacterData } from '@core/generated/common/types';
import { cardSelectUseCase } from '../card.select/card.select.usecase';
import { GameSocket } from '@common/types/game.socket';
import { C2SCardSelectRequest } from '@core/generated/packet/game_actions';
import { getGamePacketType } from '@common/converters/type.form';
import { gamePackTypeSelect } from '@game/enums/gamePacketType';

// Mock roomManger
jest.mock('../../managers/room.manager');

describe('상태 변경 카드 시나리오 (흡수, 환각)', () => {
	let user: User;
	let target: User;
	let room: Room;

	// 테스트 환경을 설정하는 헬퍼 함수
	const setupTestEnvironment = () => {
		const userData: CharacterData = {
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

		const targetData: CharacterData = {
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

		user = new User('userSocketId', '사용자');
		user.id = 'userId';
		user.setCharacter(userData);

		target = new User('targetSocketId', '타겟');
		target.id = 'targetId';
		target.setCharacter(targetData);

		room = new Room(1, user.id, '테스트룸', 8, RoomStateType.INGAME, []);
		room.addUserToRoom(user);
		room.addUserToRoom(target);

		// roomManager의 함수들을 모의 처리
		(roomManger.getRoom as jest.Mock).mockReturnValue(room);
		(roomManger.getUserFromRoom as jest.Mock).mockImplementation(
			(roomId: number, userId: string) => {
				if (userId === user.id) return user;
				if (userId === target.id) return target;
				return undefined;
			},
		);
	};

	beforeEach(() => {
		setupTestEnvironment();
		jest.spyOn(console, 'log').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('흡수 카드', () => {
		beforeEach(() => {
			user.character!.handCards.push({ type: CardType.ABSORB, count: 1 });
		});

		it('성공: 대상에게 카드가 있고 상태가 NONE일 때, 상태를 변경시킨다.', () => {
			target.character!.handCards.push({ type: CardType.BBANG, count: 1 });

			const useCardResult = useCardUseCase(user.id, room.id, CardType.ABSORB, target.id);

			expect(useCardResult.success).toBe(true);
			expect(user.character!.stateInfo!.state).toBe(CharacterStateType.ABSORBING);
			expect(user.character!.stateInfo!.stateTargetUserId).toBe(target.id);
			expect(target.character!.stateInfo!.state).toBe(CharacterStateType.ABSORB_TARGET);
		});

		it('실패: 대상의 손에 카드가 없으면 실패한다.', () => {
			target.character!.handCards = [];

			const useCardResult = useCardUseCase(user.id, room.id, CardType.ABSORB, target.id);

			expect(useCardResult.success).toBe(false);
			expect(user.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(target.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		});

		it('실패: 대상의 상태가 NONE이 아니면 실패한다.', () => {
			target.character!.handCards.push({ type: CardType.BBANG, count: 1 });
			target.character!.stateInfo!.state = CharacterStateType.BBANG_TARGET;

			const useCardResult = useCardUseCase(user.id, room.id, CardType.ABSORB, target.id);

			expect(useCardResult.success).toBe(false);
		});

		it('연계: 흡수 상태에서 대상의 손 카드를 선택하면 카드를 뺏어온다.', () => {
			// 1. 흡수 카드 사용으로 상태 변경
			target.character!.handCards.push({ type: CardType.BBANG, count: 1 });
			useCardUseCase(user.id, room.id, CardType.ABSORB, target.id);
			expect(user.character!.stateInfo!.state).toBe(CharacterStateType.ABSORBING);

			// 2. 카드 선택
			const mockSocket = { userId: user.id, roomId: room.id } as GameSocket;
			const selectRequest: C2SCardSelectRequest = {
				selectType: SelectCardType.HAND,
				selectCardType: CardType.BBANG,
			};
			const selectResult = cardSelectUseCase(mockSocket, selectRequest);

			// 3. 검증
			const response = getGamePacketType(selectResult, gamePackTypeSelect.cardSelectResponse);
			expect(response!.cardSelectResponse.success).toBe(true);
			expect(target.character!.handCards.some((c) => c.type === CardType.BBANG)).toBe(false);
			expect(user.character!.handCards.some((c) => c.type === CardType.BBANG)).toBe(true);
			expect(user.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(target.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		});
	});

	describe('신기루 카드', () => {
		beforeEach(() => {
			user.character!.handCards.push({ type: CardType.HALLUCINATION, count: 1 });
		});

		it('성공: 대상에게 카드가 있고 상태가 NONE일 때, 상태를 변경시킨다.', () => {
			target.character!.handCards.push({ type: CardType.BBANG, count: 1 });

			const useCardResult = useCardUseCase(user.id, room.id, CardType.HALLUCINATION, target.id);

			expect(useCardResult.success).toBe(true);
			expect(user.character!.stateInfo!.state).toBe(CharacterStateType.HALLUCINATING);
			expect(target.character!.stateInfo!.state).toBe(CharacterStateType.HALLUCINATION_TARGET);
		});

		it('실패: 대상의 손에 카드가 없으면 실패한다.', () => {
			target.character!.handCards = [];

			const useCardResult = useCardUseCase(user.id, room.id, CardType.HALLUCINATION, target.id);

			expect(useCardResult.success).toBe(false);
		});

		it('실패: 대상의 상태가 NONE이 아니면 실패한다.', () => {
			target.character!.handCards.push({ type: CardType.BBANG, count: 1 });
			target.character!.stateInfo!.state = CharacterStateType.BBANG_TARGET;

			const useCardResult = useCardUseCase(user.id, room.id, CardType.HALLUCINATION, target.id);

			expect(useCardResult.success).toBe(false);
		});

		it('연계: 신기루 상태에서 대상의 손 카드를 선택하면 카드가 버려진다.', () => {
			// 1. 신기루 카드 사용으로 상태 변경
			target.character!.handCards.push({ type: CardType.SHIELD, count: 1 });
			useCardUseCase(user.id, room.id, CardType.HALLUCINATION, target.id);
			expect(user.character!.stateInfo!.state).toBe(CharacterStateType.HALLUCINATING);
			const initialUserCardCount = user.character!.handCards.length;

			// 2. 카드 선택
			const mockSocket = { userId: user.id, roomId: room.id } as GameSocket;
			const selectRequest: C2SCardSelectRequest = {
				selectType: SelectCardType.HAND,
				selectCardType: CardType.SHIELD,
			};
			const selectResult = cardSelectUseCase(mockSocket, selectRequest);

			// 3. 검증
			const response = getGamePacketType(selectResult, gamePackTypeSelect.cardSelectResponse);
			expect(response!.cardSelectResponse.success).toBe(true);
			expect(target.character!.handCards.some((c) => c.type === CardType.SHIELD)).toBe(false);
			expect(user.character!.handCards.length).toBe(initialUserCardCount);
			expect(user.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(target.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		});
	});
});
