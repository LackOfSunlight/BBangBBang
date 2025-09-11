import cardAutoShieldEffect from '../card.auto_shield.effect';
import cardBbangEffect from '../card.bbang.effect';
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

describe('cardAutoShieldEffect (장착 테스트)', () => {
	const roomId = 1;
	const userId = 'user1';
	let user: User;

	beforeEach(() => {
		(getUserFromRoom as jest.Mock).mockClear();
		(updateCharacterFromRoom as jest.Mock).mockClear();

		user = new User(userId, 'socket1');
		const card: CardData = { type: CardType.AUTO_SHIELD, count: 1 };
		user.character = new Character(CharacterType.RED, RoleType.NONE_ROLE, 4, 0, [], [], [card], 1, 1);

		(getUserFromRoom as jest.Mock).mockResolvedValue(user);
	});

	test('자동 쉴드 카드를 손에 들고 있을 때, 사용하면 장착되어야 합니다.', async () => {
		await cardAutoShieldEffect(roomId, userId);

		expect(user.character!.equips).toContain(CardType.AUTO_SHIELD);
		expect(user.character!.handCards.length).toBe(0);
		expect(updateCharacterFromRoom).toHaveBeenCalledTimes(1);
		expect(updateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, user.character);
	});

	test('이미 자동 쉴드를 장착하고 있을 때, 사용해도 아무 변화가 없어야 합니다.', async () => {
		user.character!.equips.push(CardType.AUTO_SHIELD); // 이미 장착한 상태로 설정

		await cardAutoShieldEffect(roomId, userId);

		// handCards는 그대로여야 하고, 업데이트는 호출되지 않아야 함
		expect(user.character!.handCards.length).toBe(1);
		expect(updateCharacterFromRoom).not.toHaveBeenCalled();
	});
});

describe('자동 쉴드 방어 효과 테스트 (뱅 카드 피격 시)', () => {
	const roomId = 1;
	const attackerId = 'attacker';
	const targetId = 'target';

	let attacker: User;
	let target: User;
	let originalRandom: () => number;

	beforeEach(() => {
		(getUserFromRoom as jest.Mock).mockClear();
		(updateCharacterFromRoom as jest.Mock).mockClear();
		originalRandom = Math.random;

		attacker = new User(attackerId, 'socket_attacker');
		const bbangCard: CardData = { type: CardType.BBANG, count: 1 };
		attacker.character = new Character(CharacterType.RED, RoleType.NONE_ROLE, 4, 0, [], [], [bbangCard], 1, 1);

		target = new User(targetId, 'socket_target');
		target.character = new Character(CharacterType.FROGGY, RoleType.NONE_ROLE, 4, 0, [CardType.AUTO_SHIELD], [], [], 1, 0);

		(getUserFromRoom as jest.Mock).mockImplementation(async (roomId, id) => {
			if (id === attackerId) return attacker;
			if (id === targetId) return target;
			return null;
		});
	});

	afterEach(() => {
		Math.random = originalRandom;
	});

	test('25% 확률로 방어에 성공해야 합니다.', async () => {
		Math.random = jest.fn(() => 0.1); // 25% 안에 들도록 설정

		await cardBbangEffect(roomId, attackerId, targetId);

		// 방어에 성공했으므로 체력 변화 및 업데이트가 없어야 함
		expect(target.character!.hp).toBe(4);
		expect(updateCharacterFromRoom).not.toHaveBeenCalled();
	});

	test('75% 확률로 방어에 실패하고 데미지를 입어야 합니다.', async () => {
		Math.random = jest.fn(() => 0.5); // 25%를 벗어나도록 설정

		await cardBbangEffect(roomId, attackerId, targetId);

		// 방어에 실패했으므로 체력이 1 감소해야 함
		expect(target.character!.hp).toBe(3);
		expect(updateCharacterFromRoom).toHaveBeenCalledTimes(1);
		expect(updateCharacterFromRoom).toHaveBeenCalledWith(roomId, targetId, target.character);
	});
});