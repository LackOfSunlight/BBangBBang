import cardSatelliteTargetEffect from '../card.satellite_target.effect';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/redis.util';
import { User } from '../../models/user.model';
import { Character } from '../../models/character.model';
import { Room } from '../../models/room.model';
import { CharacterType, RoleType, CardType } from '../../generated/common/enums';

// redis.util 모듈 모킹
jest.mock('../../utils/redis.util.js', () => ({
	getRoom: jest.fn(),
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

describe('cardSatelliteTargetEffect', () => {
	const roomId = 1;
	const userId = 'user1'; // 시전자
	const targetId = 'user2'; // 현재 디버프 대상
	const nextTargetId = 'user3'; // 다음 디버프 대상

	let room: Room;
	let target: User;
	let nextTarget: User;
	let originalRandom: () => number;

	beforeEach(() => {
		// 모킹된 함수 초기화
		(getRoom as jest.Mock).mockClear();
		(getUserFromRoom as jest.Mock).mockClear();
		(updateCharacterFromRoom as jest.Mock).mockClear();

		// Math.random을 백업
		originalRandom = Math.random;

		// 테스트용 유저 생성
		target = new User(targetId, 'socket2');
		target.character = new Character(CharacterType.RED, RoleType.NONE_ROLE, 4, 0, [], [CardType.SATELLITE_TARGET], [], 1, 0);

		nextTarget = new User(nextTargetId, 'socket3');
		nextTarget.character = new Character(CharacterType.FROGGY, RoleType.NONE_ROLE, 4, 0, [], [], [], 1, 0);

		// 테스트용 룸 생성
		const user1 = new User(userId, 'socket1');
		room = new Room(roomId, userId, 'Test Room', 8, 0, [user1, target, nextTarget]);

		// redis.util 함수 모킹 기본 설정
		(getRoom as jest.Mock).mockResolvedValue(room);
		(getUserFromRoom as jest.Mock).mockImplementation(async (roomId, id) => {
			if (id === targetId) return target;
			if (id === nextTargetId) return nextTarget;
			return room.users.find((u) => u.id === id) || null;
		});
	});

	afterEach(() => {
		// 각 테스트 후 Math.random 복원
		Math.random = originalRandom;
	});

	test('3% 확률로 효과가 발동하여 대상의 HP가 3 감소해야 합니다.', async () => {
		// Math.random이 0.03보다 작은 값을 반환하도록 모킹
		Math.random = jest.fn(() => 0.01);

		await cardSatelliteTargetEffect(roomId, userId, targetId);

		// 대상의 HP가 3 감소했는지 확인 (4 -> 1)
		expect(target.character!.hp).toBe(1);
		// 대상의 정보만 업데이트되어야 함
		expect(updateCharacterFromRoom).toHaveBeenCalledTimes(1);
		expect(updateCharacterFromRoom).toHaveBeenCalledWith(roomId, targetId, target.character);
	});

	test('97% 확률로 효과가 미발동하고 다음 유저에게 디버프가 이전되어야 합니다.', async () => {
		// Math.random이 0.03보다 큰 값을 반환하도록 모킹
		Math.random = jest.fn(() => 0.5);

		await cardSatelliteTargetEffect(roomId, userId, targetId);

		// 1. 기존 타겟의 디버프가 제거되었는지 확인
		expect(target.character!.debuffs).not.toContain(CardType.SATELLITE_TARGET);

		// 2. 다음 타겟에게 디버프가 추가되었는지 확인
		expect(nextTarget.character!.debuffs).toContain(CardType.SATELLITE_TARGET);

		// 3. 두 유저의 정보가 모두 업데이트되었는지 확인
		expect(updateCharacterFromRoom).toHaveBeenCalledTimes(2);
		expect(updateCharacterFromRoom).toHaveBeenCalledWith(roomId, targetId, target.character);
		expect(updateCharacterFromRoom).toHaveBeenCalledWith(roomId, nextTargetId, nextTarget.character);
	});
});