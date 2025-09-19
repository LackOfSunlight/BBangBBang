import destroyCardUseCase from './destroy.card.usecase';
import { C2SDestroyCardRequest } from '../../generated/packet/game_actions';
import { GameSocket } from '../../type/game.socket';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { GamePacketType } from '../../enums/gamePacketType';
import { CardData, CharacterData, CharacterStateInfoData } from '../../generated/common/types';
import { User } from '../../models/user.model';
import { CardType, CharacterType, RoleType } from '../../generated/common/enums';

jest.mock('../../utils/room.utils');

describe('destroyCardUseCase', () => {
	let mockSocket: Partial<GameSocket>;
	let mockUser: User;
	let mockCharacterData: CharacterData;

	beforeEach(() => {
		mockSocket = { userId: '1', roomId: 1 };
		mockUser = new User('1', 'testUser');
		mockCharacterData = {
			characterType: CharacterType.RED,
			roleType: RoleType.TARGET,
			hp: 4,
			weapon: 0,
			equips: [],
			debuffs: [],
			handCards: [
				{ type: CardType.BBANG, count: 3 },
				{ type: CardType.HAND_GUN, count: 2 },
			],
			bbangCount: 0,
			handCardsCount: 5,
		};

		mockUser.character = mockCharacterData;

		(getUserFromRoom as jest.Mock).mockReturnValue(mockUser);
		(updateCharacterFromRoom as jest.Mock).mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('카드 한 장을 성공적으로 버려야 함', async () => {
		const req: C2SDestroyCardRequest = {
			destroyCards: [{ type: CardType.BBANG, count: 1 }],
		};

		const response = await destroyCardUseCase(mockSocket as GameSocket, req);

		expect(getUserFromRoom).toHaveBeenCalledWith(1, '1');
		expect(updateCharacterFromRoom).toHaveBeenCalled();
		expect(response.payload.oneofKind).toBe(GamePacketType.destroyCardResponse);

		if (response.payload.oneofKind === 'destroyCardResponse') {
			const hand = response.payload.destroyCardResponse.handCards;
			expect(hand.find((c) => c.type === CardType.BBANG)?.count).toBe(2);
			expect(mockUser.character?.handCardsCount).toBe(4);
		}
	});

	it('핸드건 카드 모두 버려 패에서 제거해야 함', async () => {
		const req: C2SDestroyCardRequest = {
			destroyCards: [{ type: CardType.HAND_GUN, count: 2 }],
		};

		const response = await destroyCardUseCase(mockSocket as GameSocket, req);

		expect(updateCharacterFromRoom).toHaveBeenCalled();
		if (response.payload.oneofKind === 'destroyCardResponse') {
			const hand = response.payload.destroyCardResponse.handCards;
			expect(hand.find((c) => c.type === CardType.HAND_GUN)).toBeUndefined();
			expect(mockUser.character?.handCardsCount).toBe(3);
		}
	});

	it('여러 종류의 카드를 버려야 함', async () => {
		const req: C2SDestroyCardRequest = {
			destroyCards: [
				{ type: CardType.HAND_GUN, count: 1 },
				{ type: CardType.BBANG, count: 2 },
			],
		};

		const response = await destroyCardUseCase(mockSocket as GameSocket, req);

		expect(updateCharacterFromRoom).toHaveBeenCalled();
		if (response.payload.oneofKind === 'destroyCardResponse') {
			const hand = response.payload.destroyCardResponse.handCards;
			expect(hand.find((c) => c.type === CardType.HAND_GUN)?.count).toBe(1);
			expect(hand.find((c) => c.type === CardType.BBANG)?.count).toBe(1);
			expect(mockUser.character?.handCardsCount).toBe(2);
		}
	});

	it('가지고 있지 않은 카드를 버리려고 하면 아무 일도 일어나지 않아야 함', async () => {
		const req: C2SDestroyCardRequest = {
			destroyCards: [{ type: CardType.SNIPER_GUN, count: 1 }],
		};

		const initialHandCount = mockUser.character!.handCardsCount;
		const response = await destroyCardUseCase(mockSocket as GameSocket, req);

		expect(updateCharacterFromRoom).toHaveBeenCalled();
		if (response.payload.oneofKind === 'destroyCardResponse') {
			expect(response.payload.destroyCardResponse.handCards.length).toBe(2);
			expect(mockUser.character?.handCardsCount).toBe(initialHandCount);
		}
	});

	it('유저를 찾을 수 없으면 빈 손패를 반환해야 함', async () => {
		(getUserFromRoom as jest.Mock).mockReturnValue(undefined);
		const req: C2SDestroyCardRequest = {
			destroyCards: [{ type: CardType.BBANG, count: 1 }],
		};

		const response = await destroyCardUseCase(mockSocket as GameSocket, req);

		expect(updateCharacterFromRoom).not.toHaveBeenCalled();
		if (response.payload.oneofKind === 'destroyCardResponse') {
			expect(response.payload.destroyCardResponse.handCards).toEqual([]);
		}
	});
});
