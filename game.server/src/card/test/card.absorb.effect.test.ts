import cardAbsorbEffect from '../card.absorb.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/redis.util';
import { User } from '../../models/user.model';
import { Character } from '../../models/character.model';
import { CharacterType, RoleType, CardType } from '../../generated/common/enums';
import { CardData } from '../../generated/common/types';

// redis.util 모듈 모킹
jest.mock('../../utils/redis.util.js', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

describe('cardAbsorbEffect', () => {
	const roomId = 1;
	const userId = 'user1';
	const targetId = 'user2';

	let user: User;
	let target: User;

	beforeEach(() => {
		// 모킹된 함수 초기화
		(getUserFromRoom as jest.Mock).mockClear();
		(updateCharacterFromRoom as jest.Mock).mockClear();

		// 테스트용 유저 생성
		user = new User(userId, 'socket1');
		user.character = new Character(CharacterType.RED, RoleType.NONE_ROLE, 4, 0, [], [], [], 1, 0);

		target = new User(targetId, 'socket2');
		const targetCard: CardData = { type: CardType.BBANG, count: 1 };
		target.character = new Character(
			CharacterType.FROGGY,
			RoleType.NONE_ROLE,
			4,
			0,
			[],
			[],
			[targetCard],
			1,
			1,
		);

		// getUserFromRoom 모킹
		(getUserFromRoom as jest.Mock).mockImplementation(async (roomId, id) => {
			if (id === userId) return user;
			if (id === targetId) return target;
			return null;
		});
	});

	test('대상이 카드를 가지고 있을 때, 카드 한 장을 훔쳐야 합니다.', async () => {
		const originalTargetCard = { ...target.character!.handCards[0] };
		const initialUserHandCount = user.character!.handCards.length;
		const initialTargetHandCount = target.character!.handCards.length;

		await cardAbsorbEffect(roomId, userId, targetId);

		// 시전자의 손에는 카드가 1장 추가되어야 함
		expect(user.character!.handCards.length).toBe(initialUserHandCount + 1);
		// 대상의 손에는 카드가 1장 감소해야 함
		expect(target.character!.handCards.length).toBe(initialTargetHandCount - 1);

		// 훔친 카드가 일치하는지 확인
		expect(user.character!.handCards[0]).toEqual(originalTargetCard);

		// 두 유저의 정보가 모두 업데이트되었는지 확인
		expect(updateCharacterFromRoom).toHaveBeenCalledTimes(2);
		expect(updateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, user.character);
		expect(updateCharacterFromRoom).toHaveBeenCalledWith(roomId, targetId, target.character);
	});

	test('대상이 카드를 가지고 있지 않을 때, 아무 일도 일어나지 않아야 합니다.', async () => {
		target.character!.handCards = []; // 대상의 손을 비움

		const initialUserHandCount = user.character!.handCards.length;

		await cardAbsorbEffect(roomId, userId, targetId);

		// 시전자와 대상의 손 카드 개수에 변화가 없어야 함
		expect(user.character!.handCards.length).toBe(initialUserHandCount);
		expect(target.character!.handCards.length).toBe(0);

		// 아무런 상호작용이 없어야 함
		expect(updateCharacterFromRoom).not.toHaveBeenCalled();
	});
});
