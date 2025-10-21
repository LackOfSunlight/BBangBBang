import { reactionUpdateUseCase } from './reaction.update.usecase';
import { ReactionType, GlobalFailCode, CharacterStateType, CardType } from '@core/generated/common/enums';
import { GameSocket } from '@common/types/game.socket';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import { Character } from '@game/models/character.model';
import roomManger from '@game/managers/room.manager';
import { broadcastDataToRoom } from '@core/network/sockets/notification';
import takeDamageService from '@game/services/take.damage.service';
import { CheckBigBbangService } from '@game/services/bigbbang.check.service';
import { CheckGuerrillaService } from '@game/services/guerrilla.check.service';
import { useCardUseCase } from '../use.card/use.card.usecase';
import { BBangCard } from '@game/cards/card.bbang';

// Mock 설정
jest.mock('../../managers/room.manager');
jest.mock('../../sockets/notification');
jest.mock('../../services/take.damage.service');
jest.mock('../../services/bigbbang.check.service');
jest.mock('../../services/guerrilla.check.service');

/**
 * 플레이어 반응 업데이트 기능 테스트
 * 
 * 실제 E2E 게임 시나리오:
 * 1. 빵야 공격 → 반응: 플레이어A가 빵야로 공격 → 플레이어B가 반응 버튼 클릭
 * 2. 무차별 난사 → 반응: 플레이어A가 무차별 난사로 공격 → 플레이어B가 반응 버튼 클릭
 * 3. 게릴라 공격 → 반응: 플레이어A가 게릴라로 공격 → 플레이어B가 반응 버튼 클릭
 * 4. 현피 실패: 현피 중 빵야 카드 없어서 패배 처리
 * 5. 현피 대기: 현피 중 아직 차례가 아님 (반응 불가)
 */
describe('reactionUpdateUseCase', () => {
	let mockRoom: Room;
	let mockUser: User;
	let mockShooter: User;
	let mockSocket: GameSocket;

	beforeEach(() => {
		// Mock 초기화
		jest.clearAllMocks();
		
		// Mock 서비스 설정
		(takeDamageService as jest.Mock).mockImplementation(() => {});
		(CheckBigBbangService as jest.Mock).mockImplementation((room) => room);
		(CheckGuerrillaService as jest.Mock).mockImplementation((room) => room);
		(broadcastDataToRoom as jest.Mock).mockImplementation(() => {});
		(roomManger.getRoom as jest.Mock).mockImplementation(() => null);
	});

	/**
	 * 시나리오 1: 빵야 공격 → 반응
	 */
	it('E2E 시나리오 1: 빵야 공격에 대한 반응이 정상적으로 처리되어야 함', async () => {
		// Given: 플레이어A가 빵야로 공격한 후 플레이어B가 반응 버튼을 클릭한 상황
		const { room, attacker, victim, socket } = createGameScenario({
			attackerId: 'playerA',
			victimId: 'playerB',
			attackType: 'BBANG',
			victimState: CharacterStateType.NONE_CHARACTER_STATE // 빵 카드 사용을 위해 NONE 상태로 설정
		});

		// 빵 카드를 실제로 사용해서 bbangCount 증가
		const bbangCard = new BBangCard();
		const useResult = bbangCard.useCard(room, attacker, victim);
		expect(useResult).toBe(true); // 빵 카드 사용 성공 확인

		// 빵 카드 사용 후 상태 확인
		expect(attacker.character!.bbangCount).toBe(1);
		expect(victim.character!.stateInfo!.state).toBe(CharacterStateType.BBANG_TARGET);

		// When: 플레이어B가 반응 버튼 클릭
		const result = await reactionUpdateUseCase(socket, ReactionType.NONE_REACTION);

		// Then: 반응 처리 성공
		expect(result.success).toBe(true);
		expect(result.failcode).toBe(GlobalFailCode.NONE_FAILCODE);

		// 플레이어B가 데미지를 받았는지 확인
		expect(takeDamageService).toHaveBeenCalledWith(room, victim, expect.any(Number), attacker);

		// 양쪽 플레이어 상태가 초기화되었는지 확인
		expect(victim.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		expect(attacker.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);

		// 플레이어A의 빵야 카운트가 증가했는지 확인
		expect(attacker.character!.bbangCount).toBe(1);

		// 모든 플레이어에게 상태 변경이 알림되었는지 확인
		expect(broadcastDataToRoom).toHaveBeenCalled();
	});

	/**
	 * 시나리오 2: 무차별 난사 공격 → 반응
	 */
	it('E2E 시나리오 2: 무차별 난사 공격에 대한 반응이 정상적으로 처리되어야 함', async () => {
		// Given: 플레이어A가 무차별 난사로 공격한 후 플레이어B가 반응 버튼을 클릭한 상황
		const { room, attacker, victim, socket } = createGameScenario({
			attackerId: 'playerA',
			victimId: 'playerB',
			attackType: 'BIG_BBANG',
			victimState: CharacterStateType.BIG_BBANG_TARGET
		});

		// When: 플레이어B가 반응 버튼 클릭
		const result = await reactionUpdateUseCase(socket, ReactionType.NONE_REACTION);

		// Then: 반응 처리 성공
		expect(result.success).toBe(true);
		expect(result.failcode).toBe(GlobalFailCode.NONE_FAILCODE);

		// 플레이어B가 데미지를 받았는지 확인
		expect(takeDamageService).toHaveBeenCalledWith(room, victim, 1, attacker);

		// 플레이어B 상태가 초기화되었는지 확인
		expect(victim.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);

		// 무차별 난사 효과가 발동했는지 확인
		expect(CheckBigBbangService).toHaveBeenCalledWith(room);

		// 모든 플레이어에게 상태 변경이 알림되었는지 확인
		expect(broadcastDataToRoom).toHaveBeenCalled();
	});

	/**
	 * 시나리오 3: 게릴라 공격 → 반응
	 */
	it('E2E 시나리오 3: 게릴라 공격에 대한 반응이 정상적으로 처리되어야 함', async () => {
		// Given: 플레이어A가 게릴라로 공격한 후 플레이어B가 반응 버튼을 클릭한 상황
		const { room, attacker, victim, socket } = createGameScenario({
			attackerId: 'playerA',
			victimId: 'playerB',
			attackType: 'GUERRILLA',
			victimState: CharacterStateType.GUERRILLA_TARGET
		});

		// When: 플레이어B가 반응 버튼 클릭
		const result = await reactionUpdateUseCase(socket, ReactionType.NONE_REACTION);

		// Then: 반응 처리 성공
		expect(result.success).toBe(true);
		expect(result.failcode).toBe(GlobalFailCode.NONE_FAILCODE);

		// 플레이어B가 데미지를 받았는지 확인
		expect(takeDamageService).toHaveBeenCalledWith(room, victim, 1, attacker);

		// 플레이어B 상태가 초기화되었는지 확인
		expect(victim.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);

		// 게릴라 효과가 발동했는지 확인
		expect(CheckGuerrillaService).toHaveBeenCalledWith(room);

		// 모든 플레이어에게 상태 변경이 알림되었는지 확인
		expect(broadcastDataToRoom).toHaveBeenCalled();
	});

	/**
	 * 시나리오 4: 현피 실패
	 */
	it('E2E 시나리오 4: 현피 중 빵야 카드 없어서 패배 처리가 정상적으로 처리되어야 함', async () => {
		// Given: 현피 중인 플레이어A가 빵야 카드가 없어서 패배하는 상황
		const { room, loser, winner, socket } = createGameScenario({
			attackerId: 'playerA',
			victimId: 'playerB',
			attackType: 'DEATH_MATCH_FAILURE',
			victimState: CharacterStateType.DEATH_MATCH_TURN_STATE
		});

		// When: 플레이어A가 반응 버튼 클릭 (패배 인정)
		const result = await reactionUpdateUseCase(socket, ReactionType.NONE_REACTION);

		// Then: 패배 처리 성공
		expect(result.success).toBe(true);
		expect(result.failcode).toBe(GlobalFailCode.NONE_FAILCODE);

		// 플레이어A가 패배 데미지를 받았는지 확인
		expect(takeDamageService).toHaveBeenCalledWith(room, loser, 1, winner);

		// 양쪽 플레이어 상태가 초기화되었는지 확인
		expect(loser.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		expect(loser.character!.stateInfo!.stateTargetUserId).toBe('0');
		expect(winner.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		expect(winner.character!.stateInfo!.stateTargetUserId).toBe('0');

		// 모든 플레이어에게 상태 변경이 알림되었는지 확인
		expect(broadcastDataToRoom).toHaveBeenCalled();
	});


	/**
	 * 시나리오 5: A-B가 현피 중일 때 C가 빵야로 끼어들면 거부되어야 함
	 */
	it('시나리오 5: 현피 중 제3자의 빵야 시도는 거부되어야 함', async () => {
		// Given: A(턴), B(대기), C(제3자)
		const a = createMockUser('playerA', '현피A', {
			state: CharacterStateType.DEATH_MATCH_TURN_STATE,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: '0',
			stateTargetUserId: 'playerB',
		});
		const b = createMockUser('playerB', '현피B', {
			state: CharacterStateType.DEATH_MATCH_STATE,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: '0',
			stateTargetUserId: 'playerA',
		});
		const c = createMockUser('playerC', '제3자', {
			state: CharacterStateType.NONE_CHARACTER_STATE,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: '0',
			stateTargetUserId: '0',
		});

		const room = createMockRoom([a, b, c]);
		(roomManger.getRoom as jest.Mock).mockReturnValue(room);

		// C에게 빵야 1장 지급
		c.character!.handCards = [{ type: CardType.BBANG, count: 1 }];

		// When: C가 A에게 빵야 시도(useCardUseCase 경로)
		const res = useCardUseCase('playerC', 1, CardType.BBANG, 'playerA');

		// Then: 요청 거부, 카드 미소모, 상태 유지
		expect(res.success).toBe(false);
		expect(res.failcode).toBe(GlobalFailCode.INVALID_REQUEST);
		const cBbang = c.character!.handCards.find((h) => h.type === CardType.BBANG);
		expect(cBbang?.count).toBe(1);
		expect(a.character!.stateInfo!.state).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);
		expect(b.character!.stateInfo!.state).toBe(CharacterStateType.DEATH_MATCH_STATE);
	});


	// 헬퍼 함수들
	/**
	 * 게임 시나리오 생성 헬퍼 함수
	 * 실제 게임 상황을 시뮬레이션하여 테스트 환경을 구성
	 */
	function createGameScenario({ 
		attackerId, 
		victimId, 
		attackType, 
		victimState 
	}: { 
		attackerId: string; 
		victimId: string; 
		attackType: string; 
		victimState: CharacterStateType; 
	}) {
		// 공격자 생성
		const attacker = createMockUser(attackerId, '공격자', {
			state: CharacterStateType.NONE_CHARACTER_STATE,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: '0',
			stateTargetUserId: '0',
		});

		// 피격자 생성
		const victim = createMockUser(victimId, '피격자', {
			state: victimState,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: '0',
			stateTargetUserId: attackerId,
		});

		// 방 생성
		const room = createMockRoom([attacker, victim]);

		// 소켓 생성 (피격자 관점)
		const socket = createMockSocket(victimId, '1');

		// Mock 설정
		(roomManger.getRoom as jest.Mock).mockReturnValue(room);

		return { 
			room, 
			attacker, 
			victim, 
			player: victim, // 피격자가 반응하는 플레이어
			loser: victim,  // 현피 실패 시 패배자
			winner: attacker, // 현피 실패 시 승리자
			socket 
		};
	}

	/**
	 * 기존 테스트 환경 생성 헬퍼 함수 (하위 호환성)
	 */
	function createTestEnvironment({ userState, shooterId }: { userState: CharacterStateType; shooterId: string }) {
		// 피격자 생성
		const user = createMockUser('user1', '피격자', {
			state: userState,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: '0',
			stateTargetUserId: shooterId,
		});

		// 공격자/대상자 생성
		const shooter = createMockUser(shooterId, '공격자', {
			state: CharacterStateType.NONE_CHARACTER_STATE,
			nextState: CharacterStateType.NONE_CHARACTER_STATE,
			nextStateAt: '0',
			stateTargetUserId: '0',
		});

		// 방 생성
		const room = createMockRoom([user, shooter]);

		// 소켓 생성
		const socket = createMockSocket('user1', '1');

		// Mock 설정
		(roomManger.getRoom as jest.Mock).mockReturnValue(room);

		return { room, user, shooter, target: shooter, socket };
	}

	function createMockUser(id: string, nickname: string, stateInfo: any): User {
		return {
			id,
			nickname,
			character: new Character(
				1, // CharacterType
				1, // RoleType
				4, // hp
				0, // weapon
				stateInfo, // stateInfo
				[], // equips
				[], // debuffs
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
			toData: jest.fn().mockReturnValue({ users }),
			// BBangCard.useCard에서 필요한 메서드들 추가
			removeCard: jest.fn().mockReturnValue(true),
			drawCards: jest.fn().mockReturnValue([]),
			getDeckSize: jest.fn().mockReturnValue(10),
			canStartGame: jest.fn().mockReturnValue(true)
		} as any;
	}

	function createMockSocket(userId: string | undefined, roomId: string | undefined): GameSocket {
		return {
			userId,
			roomId,
		} as any;
	}
});
