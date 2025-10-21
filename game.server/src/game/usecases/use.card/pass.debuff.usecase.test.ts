import passDebuffUseCase from '../pass.debuff/pass.debuff.usecase';
import { CardType, GlobalFailCode } from '@core/generated/common/enums';
import { GamePacketType } from '@game/enums/gamePacketType';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import { Character } from '@game/models/character.model';
import { GameSocket } from '@common/types/game.socket';
import roomManger from '@game/managers/room.manager';
import { setBombTimer } from '@game/services/set.bomb.timer.service';
import { broadcastDataToRoom } from '@core/network/sockets/notification';

// Mock 설정
jest.mock('../../managers/room.manager');
jest.mock('../../services/set.bomb.timer.service');
jest.mock('../../sockets/notification');

/**
 * 디버프 전달 기능 테스트
 * 
 * 실제 게임 시나리오:
 * 1. 폭탄 디버프 전달 (폭발 전에 다른 플레이어에게 전달)
 * 2. 위성타겟 디버프 전달 (번개 맞기 전에 다른 플레이어에게 전달)
 * 3. 디버프 소지 조건 위반 (요청자 없음, 대상자 이미 보유)
 */
describe('passDebuffUseCase', () => {

	beforeEach(() => {
		// Mock 초기화
		jest.clearAllMocks();
		(setBombTimer.clearTimer as jest.Mock).mockReturnValue(Date.now() + 10000);
		(setBombTimer.startBombTimer as jest.Mock).mockImplementation(() => {});
		(broadcastDataToRoom as jest.Mock).mockImplementation(() => {});
	});

	/**
	 * 시나리오 1: 폭탄 디버프 전달 (실제 게임 상황)
	 * - 플레이어A가 폭탄을 받았지만 폭발 전에 플레이어B에게 전달
	 * - 폭탄 타이머가 이전되고 디버프가 이동하는지 확인
	 */
	it('시나리오 1: 폭탄 디버프 전달이 성공해야 함', async () => {
		// Given: 폭탄을 가진 플레이어와 받을 플레이어 설정
		const bombUser = createMockUser('bomb-user', '폭탄보유자', [CardType.BOMB]);
		const targetUser = createMockUser('target-user', '타겟플레이어', []);
		const room = createMockRoom([bombUser, targetUser]);
		const socket = createMockSocket('bomb-user', '1', bombUser);
		const request = { targetUserId: 'target-user', debuffCardType: CardType.BOMB };

		(roomManger.getRoom as jest.Mock).mockReturnValue(room);

		// When
		const result = await passDebuffUseCase(socket, request);

		// Then
		expect(result.payload.oneofKind).toBe(GamePacketType.passDebuffResponse);
		if (result.payload.oneofKind === GamePacketType.passDebuffResponse) {
			expect(result.payload.passDebuffResponse.success).toBe(true);
			expect(result.payload.passDebuffResponse.failCode).toBe(GlobalFailCode.NONE_FAILCODE);
		}

		// 폭탄 디버프 이동 확인
		expect(bombUser.character!.debuffs).not.toContain(CardType.BOMB);
		expect(targetUser.character!.debuffs).toContain(CardType.BOMB);

		// 폭탄 타이머 이전 확인
		expect(setBombTimer.clearTimer).toHaveBeenCalledWith('1:bomb-user');
		expect(setBombTimer.startBombTimer).toHaveBeenCalledWith(room, targetUser, expect.any(Number));

		// 브로드캐스트 확인 (userUpdate + warning)
		expect(broadcastDataToRoom).toHaveBeenCalledTimes(2);
	});

	/**
	 * 시나리오 2: 폭탄 디버프 전달 실패 (수신자가 이미 보유)
	 * - 플레이어A가 폭탄을 받았지만 플레이어B도 이미 폭탄을 가지고 있는 상황
	 * - 디버프 전달이 실패하는지 확인
	 */
	it('시나리오 2: 수신자가 이미 폭탄을 가지고 있으면 전달이 실패해야 함', async () => {
		// Given: 둘 다 폭탄을 가진 플레이어들
		const bombUser1 = createMockUser('bomb-user1', '폭탄보유자1', [CardType.BOMB]);
		const bombUser2 = createMockUser('bomb-user2', '폭탄보유자2', [CardType.BOMB]);
		const room = createMockRoom([bombUser1, bombUser2]);
		const socket = createMockSocket('bomb-user1', '1', bombUser1);
		const request = { targetUserId: 'bomb-user2', debuffCardType: CardType.BOMB };

		(roomManger.getRoom as jest.Mock).mockReturnValue(room);

		// When
		const result = await passDebuffUseCase(socket, request);

		// Then
		expect(result.payload.oneofKind).toBe(GamePacketType.passDebuffResponse);
		if (result.payload.oneofKind === GamePacketType.passDebuffResponse) {
			expect(result.payload.passDebuffResponse.success).toBe(false);
			expect(result.payload.passDebuffResponse.failCode).toBe(GlobalFailCode.CHARACTER_NO_CARD);
		}

		// 디버프가 이동하지 않았는지 확인
		expect(bombUser1.character!.debuffs).toContain(CardType.BOMB);
		expect(bombUser2.character!.debuffs).toContain(CardType.BOMB);
	});

	/**
	 * 시나리오 3: 디버프 소지 조건 위반
	 * - 전달자가 디버프를 가지고 있지 않으면 실패해야 함
	 */
	it('시나리오 3: 전달자가 디버프를 가지고 있지 않으면 실패해야 함', async () => {
		// Given: 디버프를 가지고 있지 않은 플레이어
		const noDebuffUser = createMockUser('no-debuff-user', '디버프없는플레이어', []);
		const targetUser = createMockUser('target-user', '타겟플레이어', []);
		const room = createMockRoom([noDebuffUser, targetUser]);
		const socket = createMockSocket('no-debuff-user', '1', noDebuffUser);
		const request = { targetUserId: 'target-user', debuffCardType: CardType.BOMB };

		(roomManger.getRoom as jest.Mock).mockReturnValue(room);

		// When
		const result = await passDebuffUseCase(socket, request);

		// Then
		expect(result.payload.oneofKind).toBe(GamePacketType.passDebuffResponse);
		if (result.payload.oneofKind === GamePacketType.passDebuffResponse) {
			expect(result.payload.passDebuffResponse.success).toBe(false);
			expect(result.payload.passDebuffResponse.failCode).toBe(GlobalFailCode.CHARACTER_NO_CARD);
		}

		// 디버프가 이동하지 않았는지 확인
		expect(noDebuffUser.character!.debuffs).not.toContain(CardType.BOMB);
		expect(targetUser.character!.debuffs).not.toContain(CardType.BOMB);
	});

	// 헬퍼 함수들
	function createMockUser(id: string, nickname: string, debuffs: CardType[]): User {
		return {
			id,
			nickname,
			character: new Character(
				1, // CharacterType
				1, // RoleType
				100, // hp
				0, // weapon
				{ state: 0, nextState: 0, nextStateAt: '0', stateTargetUserId: '0' }, // stateInfo
				[], // equips
				debuffs, // debuffs
				[], // handCards
				0, // bbangCount
				0, // handCardsCount
			),
			setUserData: jest.fn(),
			setCharacter: jest.fn(),
			toData: jest.fn(),
		} as any;
	}

	function createMockRoom(users: User[]): Room {
		return {
			id: 1,
			ownerId: users[0].id,
			name: 'Test Room',
			maxUserNum: 4,
			state: 0, // WAIT
			users,
			toData: jest.fn().mockReturnValue({ users })
		} as any;
	}

	function createMockSocket(userId: string, roomId: string, user: User): GameSocket {
		return {
			id: 'socket-123',
			userId,
			roomId,
			user,
		} as any;
	}
});
