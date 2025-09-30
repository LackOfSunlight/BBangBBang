import { GameSocket } from '../../type/game.socket';
import roomManager from '../../managers/room.manager';
import destroyCardUseCase from './destroy.card.usecase';
import { C2SDestroyCardRequest } from '../../generated/packet/game_actions';
import { CardType, CharacterType, RoleType } from '../../generated/common/enums';
import { User } from '../../models/user.model';
import { CharacterData } from '../../generated/common/types';
import { getGamePacketType } from '../../converter/type.form';
import { gamePackTypeSelect } from '../../enums/gamePacketType';

jest.mock('../../managers/room.manager');

describe('destroyCardUseCase', () => {
	let mockSocket: GameSocket;
	let mockUser: User;

	beforeEach(() => {
		mockSocket = { userId: '1', roomId: 1 } as GameSocket;

		// 테스트용 유저와 손패를 설정합니다.
		mockUser = new User('1', 'testUser');
		const characterData: Partial<CharacterData> = {
			hp: 4,
			handCards: [
				{ type: CardType.BBANG, count: 3 },
				{ type: CardType.SHIELD, count: 2 },
			],
		};
		mockUser.setCharacter(characterData as CharacterData);
		mockUser.character!.handCardsCount = 5;

		// roomManager가 항상 이 유저를 반환하도록 모의 처리합니다.
		(roomManager.getUserFromRoom as jest.Mock).mockReturnValue(mockUser);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('성공: 카드 한 장을 버리면 해당 카드 묶음의 개수가 감소한다', async () => {
		const req: C2SDestroyCardRequest = {
			destroyCards: [{ type: CardType.BBANG, count: 1 }],
		};

		const responsePacket = await destroyCardUseCase(mockSocket, req);
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.destroyCardResponse);
		expect(payload).toBeDefined();
		if (!payload) return;

		const { handCards } = payload.destroyCardResponse;

		expect(handCards.find((c) => c.type === CardType.BBANG)?.count).toBe(2);
		expect(mockUser.character!.handCardsCount).toBe(4);
	});

	it('성공: 카드 묶음 전체를 버리면 패에서 해당 카드 묶음이 제거된다', async () => {
		const req: C2SDestroyCardRequest = {
			destroyCards: [{ type: CardType.SHIELD, count: 2 }],
		};

		const responsePacket = await destroyCardUseCase(mockSocket, req);
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.destroyCardResponse);
		expect(payload).toBeDefined();
		if (!payload) return;

		const { handCards } = payload.destroyCardResponse;

		expect(handCards.find((c) => c.type === CardType.SHIELD)).toBeUndefined();
		expect(mockUser.character!.handCardsCount).toBe(3);
	});

	it('성공: 여러 종류의 카드를 한 번에 버린다', async () => {
		const req: C2SDestroyCardRequest = {
			destroyCards: [
				{ type: CardType.BBANG, count: 2 },
				{ type: CardType.SHIELD, count: 1 },
			],
		};

		const responsePacket = await destroyCardUseCase(mockSocket, req);
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.destroyCardResponse);
		expect(payload).toBeDefined();
		if (!payload) return;

		const { handCards } = payload.destroyCardResponse;

		expect(handCards.find((c) => c.type === CardType.BBANG)?.count).toBe(1);
		expect(handCards.find((c) => c.type === CardType.SHIELD)?.count).toBe(1);
		expect(mockUser.character!.handCardsCount).toBe(2);
	});

	it('실패: 가지고 있지 않은 카드를 버리려고 하면 아무 일도 일어나지 않는다', async () => {
		const req: C2SDestroyCardRequest = {
			destroyCards: [{ type: CardType.SNIPER_GUN, count: 1 }],
		};

		await destroyCardUseCase(mockSocket, req);

		expect(mockUser.character!.handCards.length).toBe(2);
		expect(mockUser.character!.handCardsCount).toBe(5);
	});
});
