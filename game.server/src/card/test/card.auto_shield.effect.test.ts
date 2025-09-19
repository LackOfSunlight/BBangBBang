import { equipAutoShieldEffect, AutoShieldBlock } from '../card.auto_shield.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/redis.util';
import { User } from '../../models/user.model';
import { CardType, CharacterType, RoleType, CharacterStateType } from '../../generated/common/enums';

// 함수의 직접적인 의존성인 redis.util을 모킹합니다.
jest.mock('../../utils/redis.util', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

// 타입스크립트와 함께 사용하기 위해 모킹된 함수를 캐스팅합니다.
const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;

describe('cardAutoShieldEffect (장착 테스트)', () => {
	const roomId = 1;
	const userId = 'user1';
	let user: User;

	beforeEach(() => {
		(getUserFromRoom as jest.Mock).mockClear();
		(updateCharacterFromRoom as jest.Mock).mockClear();

		user = new User(userId, 'socket1');
		const card: CardData = { type: CardType.AUTO_SHIELD, count: 1 };
		user.character = new Character(
			CharacterType.RED,
			RoleType.NONE_ROLE,
			4,
			0,
			[],
			[],
			[card],
			1,
			1,
		);

		(getUserFromRoom as jest.Mock).mockResolvedValue(user);
	});

	test('자동 쉴드 카드를 손에 들고 있을 때, 사용하면 장착되어야 합니다.', async () => {
		await cardAutoShieldEffect(roomId, userId);

		expect(user.character!.equips).toContain(CardType.AUTO_SHIELD);
		//expect(user.character!.handCards.length).toBe(0);
		expect(updateCharacterFromRoom).toHaveBeenCalledTimes(1);
	});
});

describe('자동 쉴드 방어 효과 테스트 (리액션 시)', () => {
	const roomId = 1;
	const targetId = 'target';
	const shooterId = 'shooter';

	let room: Room;
	let target: User;
	let shooter: User;
	let mockSocket: GameSocket;
	let originalRandom: () => number;

	beforeEach(() => {
		(getRoom as jest.Mock).mockClear();
		(saveRoom as jest.Mock).mockClear();
		(sendAnimationNotification as jest.Mock).mockClear();
		originalRandom = Math.random;

		// Shooter setup
		shooter = new User(shooterId, 'socket_shooter');
		const shooterStateInfo: CharacterStateInfoData = {
			state: CharacterStateType.BBANG_SHOOTER,
			nextState: 0,
			nextStateAt: '0',
			stateTargetUserId: targetId,
		};
		shooter.character = new Character(
			CharacterType.RED,
			RoleType.NONE_ROLE,
			4,
			0,
			[],
			[],
			[],
			1,
			0,
		);
		shooter.character.stateInfo = shooterStateInfo;

		// Target setup
		target = new User(targetId, 'socket_target');
		const stateInfo: CharacterStateInfoData = {
			state: CharacterStateType.BBANG_TARGET,
			nextState: 0,
			nextStateAt: '0',
			stateTargetUserId: shooterId,
		};
		target.character = new Character(
			CharacterType.FROGGY,
			RoleType.NONE_ROLE,
			4,
			0,
			[CardType.AUTO_SHIELD],
			[],
			[],
			1,
			0,
		);
		target.character.stateInfo = stateInfo;

		// Room setup
		room = new Room(roomId, 'test', 'owner', 8, 0, [target, shooter]);
		(getRoom as jest.Mock).mockResolvedValue(room);

		mockSocket = { roomId: roomId, userId: targetId, write: jest.fn() } as unknown as GameSocket;
	});

	afterEach(() => {
		Math.random = originalRandom;
	});

	const createReactionPacket = (reactionType: ReactionType): GamePacket => ({
		payload: {
			oneofKind: GamePacketType.reactionRequest,
			reactionRequest: { reactionType },
		},
	});

	test('25% 확률로 방어에 성공하고 애니메이션 알림을 전송해야 합니다.', async () => {
		Math.random = jest.fn(() => 0.1); // 25% 안에 들도록 설정
		const packet = createReactionPacket(ReactionType.NONE_REACTION);

		await reactionRequestHandler(mockSocket, packet);

		// 방어에 성공했으므로 체력 변화가 없어야 함
		expect(target.character!.hp).toBe(4);

		// 애니메이션 알림이 호출되어야 함
		expect(sendAnimationNotification).toHaveBeenCalledTimes(1);
		expect(sendAnimationNotification).toHaveBeenCalledWith(
			room.users,
			target.id,
			AnimationType.SHIELD_ANIMATION,
		);

		// saveRoom은 호출되지만, hp는 그대로여야 함
		expect(saveRoom).toHaveBeenCalledTimes(1);
		const savedRoom = (saveRoom as jest.Mock).mock.calls[0][0] as Room;
		expect(savedRoom.users.find((u) => u.id === targetId)!.character!.hp).toBe(4);
	});

	test('75% 확률로 방어에 실패하고 데미지를 입어야 합니다.', async () => {
		Math.random = jest.fn(() => 0.5); // 25%를 벗어나도록 설정
		const packet = createReactionPacket(ReactionType.NONE_REACTION);

		await reactionRequestHandler(mockSocket, packet);

		// 애니메이션 알림이 호출되지 않아야 함
		expect(sendAnimationNotification).not.toHaveBeenCalled();

		// 방어에 실패했으므로 체력이 1 감소해야 함
		expect(target.character!.hp).toBe(3);
		// saveRoom이 호출되고, hp가 3으로 저장되어야 함
		expect(saveRoom).toHaveBeenCalledTimes(1);
		const savedRoom = (saveRoom as jest.Mock).mock.calls[0][0] as Room;
		expect(savedRoom.users.find((u) => u.id === targetId)!.character!.hp).toBe(3);
	});
});