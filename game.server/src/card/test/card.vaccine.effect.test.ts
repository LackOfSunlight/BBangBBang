import cardVaccineEffect from '../card.vaccine.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/redis.util';
import { User } from '../../models/user.model';
import { Character } from '../../models/character.model';
import { CharacterType, RoleType } from '../../generated/common/enums';

// redis.util 모듈 모킹
jest.mock('../../utils/redis.util.js', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

describe('cardVaccineEffect', () => {
	const roomId = 1;
	const userId = 'user1';

	let user: User;

	beforeEach(() => {
		// 각 테스트 전에 모킹된 함수들 초기화
		(getUserFromRoom as jest.Mock).mockClear();
		(updateCharacterFromRoom as jest.Mock).mockClear();

		// 테스트용 기본 사용자 객체 설정
		user = new User(userId, 'test-socket');
		user.character = new Character(
			CharacterType.RED, // 최대 체력 4
			RoleType.NONE_ROLE,
			3, // 현재 체력 3
			0,
			[],
			[],
			[],
			1,
			0
		);
		// cardVaccineEffect는 target도 필요하므로, 동일한 유저로 설정
		(getUserFromRoom as jest.Mock).mockImplementation((roomId, id) => {
			if (id === userId) return Promise.resolve(user);
			return Promise.resolve(null);
		});
	});

	test('체력이 최대치보다 낮을 때 체력이 1 회복되어야 합니다.', async () => {
		// 현재 체력: 3, 최대 체력: 4
		await cardVaccineEffect(roomId, userId);

		expect(updateCharacterFromRoom).toHaveBeenCalledTimes(1);
		// 체력이 3에서 4로 증가했는지 확인
		expect(user.character!.hp).toBe(4);
	});

	test('체력이 최대치일 때 체력이 더 이상 회복되지 않아야 합니다.', async () => {
		user.character!.hp = 4; // 현재 체력을 최대치로 설정

		await cardVaccineEffect(roomId, userId);

		// updateCharacterFromRoom이 호출되지 않아야 함
		expect(updateCharacterFromRoom).not.toHaveBeenCalled();
		// 체력이 4에서 변하지 않았는지 확인
		expect(user.character!.hp).toBe(4);
	});

	test('최대 체력이 3인 캐릭터(공룡)가 체력을 회복해야 합니다.', async () => {
		user.character!.characterType = CharacterType.DINOSAUR; // 최대 체력 3
		user.character!.hp = 2; // 현재 체력 2

		await cardVaccineEffect(roomId, userId);

		expect(updateCharacterFromRoom).toHaveBeenCalledTimes(1);
		// 체력이 2에서 3로 증가했는지 확인
		expect(user.character!.hp).toBe(3);
	});

	test('최대 체력이 3인 캐릭터(공룡)가 최대 체력일 때 회복하지 않아야 합니다.', async () => {
		user.character!.characterType = CharacterType.DINOSAUR; // 최대 체력 3
		user.character!.hp = 3; // 현재 체력을 최대치로 설정

		await cardVaccineEffect(roomId, userId);

		expect(updateCharacterFromRoom).not.toHaveBeenCalled();
		// 체력이 3에서 변하지 않았는지 확인
		expect(user.character!.hp).toBe(3);
	});
});