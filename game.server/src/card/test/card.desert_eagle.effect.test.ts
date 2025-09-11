import cardDesertEagleEffect from '../card.desert_eagle.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/redis.util';
import { User } from '../../models/user.model';
import { Character } from '../../models/character.model';
import { CharacterType, RoleType } from '../../generated/common/enums';
import { CardData } from '../../generated/common/types';

// redis.util 모듈 모킹
jest.mock('../../utils/redis.util.js', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

describe('cardDesertEagleEffect', () => {
	const roomId = 1;
	const userId = 'user1';

	let user: User;

	beforeEach(() => {
		// 각 테스트 전에 모킹된 함수들 초기화
		(getUserFromRoom as jest.Mock).mockClear();
		(updateCharacterFromRoom as jest.Mock).mockClear();

		// 테스트용 기본 사용자 객체 설정
		user = new User(userId, 'test-socket');
        const card:CardData = { type: 15 , count: 1};
		user.character = new Character(
			CharacterType.RED,
			RoleType.HITMAN,
			4,
			0, // weapon: 0 (무기 없음)
			[],
			[],
			[card], // handCards: 데저트 이글 1장
			1,
			1,
		);
	});

	test('무기가 없는 상태에서 데저트 이글을 장착해야 합니다.', async () => {
		(getUserFromRoom as jest.Mock).mockResolvedValue(user);

		await cardDesertEagleEffect(roomId, userId);

		// updateCharacterFromRoom이 호출되었는지 확인
		expect(updateCharacterFromRoom).toHaveBeenCalledTimes(1);

		// weapon이 15로 설정되었는지 확인
		expect(user.character!.weapon).toBe(15);

		// 손에서 카드가 제거되었는지 확인
		expect(user.character!.handCards.length).toBe(0);
	});

	test('다른 무기를 장착한 상태에서 데저트 이글로 교체해야 합니다.', async () => {
		user.character!.weapon = 14; // 핸드건(14)을 장착한 상태로 설정
		(getUserFromRoom as jest.Mock).mockResolvedValue(user);

		await cardDesertEagleEffect(roomId, userId);

		expect(updateCharacterFromRoom).toHaveBeenCalledTimes(1);

		// weapon이 14에서 15로 교체되었는지 확인
		expect(user.character!.weapon).toBe(15);
		expect(user.character!.handCards.length).toBe(0);
	});

	test('손에 데저트 이글 카드가 없으면 아무 일도 일어나지 않아야 합니다.', async () => {
		user.character!.handCards = []; // 손에 카드가 없는 상태
		(getUserFromRoom as jest.Mock).mockResolvedValue(user);

		await cardDesertEagleEffect(roomId, userId);

		// 아무런 상호작용이 없어야 함
		expect(updateCharacterFromRoom).not.toHaveBeenCalled();
		expect(user.character!.weapon).toBe(0);
	});

	test('이미 데저트 이글을 장착하고 있으면 아무 일도 일어나지 않아야 합니다.', async () => {
		user.character!.weapon = 15; // 이미 데저트 이글을 장착한 상태
		(getUserFromRoom as jest.Mock).mockResolvedValue(user);

		await cardDesertEagleEffect(roomId, userId);

		// 아무런 상호작용이 없어야 함
		expect(updateCharacterFromRoom).not.toHaveBeenCalled();
	});
});
