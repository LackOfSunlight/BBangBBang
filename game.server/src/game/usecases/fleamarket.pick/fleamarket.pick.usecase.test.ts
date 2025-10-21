import fleaMarketPickUseCase from './fleamarket.pick.usecase';
import { GameSocket } from '@common/types/game.socket';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import {
	CardType,
	CharacterStateType,
	GlobalFailCode,
	RoomStateType,
	CharacterType,
	RoleType,
} from '@core/generated/common/enums';
import { C2SFleaMarketPickRequest } from '@core/generated/packet/game_actions';
import roomManger from '@game/managers/room.manager';
import { broadcastDataToRoom } from '@core/network/sockets/notification';
import { GamePacketType } from '@game/enums/gamePacketType';

jest.mock('../../managers/room.manager');
jest.mock('../../sockets/notification');

describe('플리마켓 카드 선택 시나리오', () => {
	let room: Room;
	let player1: User;
	let player2: User;
	let player3: User;
	let deadPlayer: User;
	let mockSocket: GameSocket;

	// 테스트 환경 설정 헬퍼
	const setupTestEnvironment = () => {
		// 플레이어 1: 현재 턴 (FLEA_MARKET_TURN 상태)
		player1 = new User('player1Socket', '플레이어1');
		player1.id = 'player1';
		player1.setCharacter({
			characterType: CharacterType.RED,
			roleType: RoleType.TARGET,
			hp: 4,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.FLEA_MARKET_TURN,
				nextState: CharacterStateType.FLEA_MARKET_WAIT,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		// 플레이어 2: 대기 중 (FLEA_MARKET_WAIT 상태)
		player2 = new User('player2Socket', '플레이어2');
		player2.id = 'player2';
		player2.setCharacter({
			characterType: CharacterType.SHARK,
			roleType: RoleType.TARGET,
			hp: 3,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.FLEA_MARKET_WAIT,
				nextState: CharacterStateType.FLEA_MARKET_WAIT,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		// 플레이어 3: 대기 중 (FLEA_MARKET_WAIT 상태)
		player3 = new User('player3Socket', '플레이어3');
		player3.id = 'player3';
		player3.setCharacter({
			characterType: CharacterType.MALANG,
			roleType: RoleType.TARGET,
			hp: 2,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.FLEA_MARKET_WAIT,
				nextState: CharacterStateType.FLEA_MARKET_WAIT,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		// 죽은 플레이어 (hp = 0, NONE_CHARACTER_STATE)
		deadPlayer = new User('deadSocket', '죽은플레이어');
		deadPlayer.id = 'dead';
		deadPlayer.setCharacter({
			characterType: CharacterType.FROGGY,
			roleType: RoleType.TARGET,
			hp: 0,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.NONE_CHARACTER_STATE,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		// 방 생성 및 플레이어 추가
		room = new Room(1, player1.id, '테스트방', 8, RoomStateType.INGAME, []);
		room.addUserToRoom(player1);
		room.addUserToRoom(player2);
		room.addUserToRoom(player3);
		room.addUserToRoom(deadPlayer);

		// 플리마켓 카드 설정
		room.roomFleaMarketCards = [CardType.BBANG, CardType.SHIELD, CardType.VACCINE, CardType.BOMB];
		room.fleaMarketPickIndex = [];

		// Mock 설정 - 매번 새로운 room 객체 반환
		(roomManger.getRoom as jest.Mock).mockImplementation(() => room);
		(roomManger.getUserFromRoom as jest.Mock).mockImplementation(
			(roomId: number, userId: string) => {
				return room.users.find((u) => u.id === userId);
			},
		);

		// 브로드캐스트 함수 모킹
		(broadcastDataToRoom as jest.Mock).mockImplementation(() => {});

		mockSocket = { userId: player1.id, roomId: room.id } as GameSocket;
	};

	/**
	 * 각 테스트 실행 전 초기화
	 */
	beforeEach(() => {
		jest.clearAllMocks();

		// 각 테스트마다 완전히 새로운 room 객체 생성
		room = new Room(1, 'player1', '테스트방', 8, RoomStateType.INGAME, []);

		setupTestEnvironment();

		// Mock 설정 - 매번 새로운 room 객체 반환
		(roomManger.getRoom as jest.Mock).mockImplementation(() => room);
		(roomManger.getUserFromRoom as jest.Mock).mockImplementation(
			(roomId: number, userId: string) => {
				return room.users.find((u) => u.id === userId);
			},
		);
	});

	/**
	 * 시나리오 1: 기본 카드 선택 및 턴 넘김 테스트
	 * - 플레이어1이 BBANG 카드를 선택
	 * - 카드가 손패에 추가되는지 확인
	 * - 턴이 다음 플레이어(플레이어2)로 넘어가는지 확인
	 */
	it('시나리오 1: 첫 번째 플레이어가 뱅 카드를 선택하면 손패에 추가되고 다음 플레이어에게 턴이 넘어간다', () => {
		const req: C2SFleaMarketPickRequest = { pickIndex: 0 }; // BBANG 카드

		const res = fleaMarketPickUseCase(mockSocket, req);

		// 응답 검증
		expect(res.payload.oneofKind).toBe(GamePacketType.fleaMarketPickResponse);
		if (res.payload.oneofKind === GamePacketType.fleaMarketPickResponse) {
			expect(res.payload.fleaMarketPickResponse.success).toBe(true);
			expect(res.payload.fleaMarketPickResponse.failCode).toBe(GlobalFailCode.NONE_FAILCODE);
		}

		// 선택 인덱스 기록 확인
		expect(room.fleaMarketPickIndex).toEqual([0]);

		// 플레이어1의 손패에 뱅 카드 추가 확인
		const bbangCard = player1.character!.handCards.find((c) => c.type === CardType.BBANG);
		expect(bbangCard?.count).toBe(1);
		expect(player1.character!.handCardsCount).toBe(1);

		// 상태 변화 확인: 플레이어1은 WAIT, 플레이어2는 TURN
		expect(player1.character!.stateInfo!.state).toBe(CharacterStateType.FLEA_MARKET_WAIT);
		expect(player2.character!.stateInfo!.state).toBe(CharacterStateType.FLEA_MARKET_TURN);

		// 브로드캐스트 호출 확인
		expect(broadcastDataToRoom).toHaveBeenCalledTimes(2);
	});

	/**
	 * 시나리오 2: 기존 카드 수량 증가 테스트
	 * - 플레이어2가 SHIELD 카드를 선택
	 * - 기존에 없는 카어드가 새로 추가되는지 확인
	 * - 턴이 다음 플레이어(플레이어3)로 넘가는지 확인
	 */
	it('시나리오 2: 두 번째 플레이어가 쉴드 카드를 선택하면 수량이 증가하고 다음 플레이어에게 턴이 넘어간다', () => {
		// 사전: 플레이어1이 이미 쉴드 1장 보유
		player1.character!.handCards = [{ type: CardType.SHIELD, count: 1 }];
		player1.character!.handCardsCount = 1;
		player1.character!.stateInfo!.state = CharacterStateType.FLEA_MARKET_WAIT;
		player2.character!.stateInfo!.state = CharacterStateType.FLEA_MARKET_TURN;

		// 플레이어2가 쉴드 카드 선택
		mockSocket = { userId: player2.id, roomId: room.id } as GameSocket;
		const req: C2SFleaMarketPickRequest = { pickIndex: 1 }; // SHIELD 카드

		const res = fleaMarketPickUseCase(mockSocket, req);

		expect(res.payload.oneofKind).toBe(GamePacketType.fleaMarketPickResponse);

		// 선택 인덱스 누적 확인
		expect(room.fleaMarketPickIndex).toEqual([1]);

		// 플레이어2의 손패에 쉴드 카드 추가 확인
		const shieldCard = player2.character!.handCards.find((c) => c.type === CardType.SHIELD);
		expect(shieldCard?.count).toBe(1);
		expect(player2.character!.handCardsCount).toBe(1);

		// 상태 변화 확인: 플레이어2는 WAIT, 플레이어3은 TURN
		expect(player2.character!.stateInfo!.state).toBe(CharacterStateType.FLEA_MARKET_WAIT);
		expect(player3.character!.stateInfo!.state).toBe(CharacterStateType.FLEA_MARKET_TURN);
	});

	/**
	 * 시나리오 3: 플리마켓 종료 및 상태 초기화 테스트
	 * - 모든 생존 플레이어가 FLEA_MARKET_WAIT 상태일 때
	 * - 마지막 플레이어가 카드를 선택하면 플리마켓이 종료되는지 확인
	 * - 모든 플레이어의 상태가 NONE_CHARACTER_STATE로 초기화되는지 확인
	 * - 플리마켓 데이터가 초기화되는지 확인
	 */
	it('시나리오 3: 모든 생존 플레이어가 카드를 선택하면 플리마켓이 종료되고 상태가 초기화된다', () => {
		// 완전히 새로운 room 객체 생성
		const testRoom = new Room(1, 'player1', '테스트방', 8, RoomStateType.INGAME, []);
		testRoom.fleaMarketPickIndex = [];
		testRoom.roomFleaMarketCards = [
			CardType.BBANG,
			CardType.SHIELD,
			CardType.VACCINE,
			CardType.BOMB,
		];

		// 플레이어들 재생성
		const testPlayer1 = new User('player1Socket', '플레이어1');
		testPlayer1.id = 'player1';
		testPlayer1.setCharacter({
			characterType: CharacterType.RED,
			roleType: RoleType.TARGET,
			hp: 4,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.FLEA_MARKET_WAIT,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		const testPlayer2 = new User('player2Socket', '플레이어2');
		testPlayer2.id = 'player2';
		testPlayer2.setCharacter({
			characterType: CharacterType.SHARK,
			roleType: RoleType.TARGET,
			hp: 3,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.FLEA_MARKET_WAIT,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		const testPlayer3 = new User('player3Socket', '플레이어3');
		testPlayer3.id = 'player3';
		testPlayer3.setCharacter({
			characterType: CharacterType.MALANG,
			roleType: RoleType.TARGET,
			hp: 2,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.FLEA_MARKET_WAIT,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		// 방에 플레이어들 추가
		testRoom.users = [testPlayer1, testPlayer2, testPlayer3];

		// Mock 설정 업데이트
		(roomManger.getRoom as jest.Mock).mockImplementation(() => testRoom);
		(roomManger.getUserFromRoom as jest.Mock).mockImplementation(
			(roomId: number, userId: string) => {
				return testRoom.users.find((u) => u.id === userId);
			},
		);

		// 플레이어3이 마지막 카드 선택
		const testSocket = { userId: testPlayer3.id, roomId: testRoom.id } as GameSocket;
		const req: C2SFleaMarketPickRequest = { pickIndex: 2 }; // VACCINE 카드

		const res = fleaMarketPickUseCase(testSocket, req);

		expect(res.payload.oneofKind).toBe(GamePacketType.fleaMarketPickResponse);

		// 플리마켓 종료 시 데이터 초기화 확인
		expect(testRoom.roomFleaMarketCards).toEqual([]);
		expect(testRoom.fleaMarketPickIndex).toEqual([]);

		// 모든 플레이어의 상태가 기본 상태로 복귀
		expect(testPlayer1.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		expect(testPlayer2.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		expect(testPlayer3.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);

		expect(broadcastDataToRoom).toHaveBeenCalledTimes(2);
	});

	/**
	 * 시나리오 4: 죽은 플레이어 건너뛰기 테스트
	 * - 플레이어2가 죽은 상태(hp = 0)일 때
	 * - 플레이어1이 카드를 선택하면 플레이어2를 건너뛰고 플레이어3에게 턴이 넘어가는지 확인
	 * - 죽은 플레이어의 상태는 변경되지 않는지 확인
	 */
	it('시나리오 4: 죽은 플레이어는 턴 순서에서 제외되고 다음 생존 플레이어에게 턴이 넘어간다', () => {
		// 완전히 새로운 room 객체 생성
		const testRoom = new Room(1, 'player1', '테스트방', 8, RoomStateType.INGAME, []);
		testRoom.fleaMarketPickIndex = [];
		testRoom.roomFleaMarketCards = [
			CardType.BBANG,
			CardType.SHIELD,
			CardType.VACCINE,
			CardType.BOMB,
		];

		// 플레이어들 재생성
		const testPlayer1 = new User('player1Socket', '플레이어1');
		testPlayer1.id = 'player1';
		testPlayer1.setCharacter({
			characterType: CharacterType.RED,
			roleType: RoleType.TARGET,
			hp: 4,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.FLEA_MARKET_TURN,
				nextState: CharacterStateType.FLEA_MARKET_WAIT,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		const testPlayer2 = new User('player2Socket', '플레이어2');
		testPlayer2.id = 'player2';
		testPlayer2.setCharacter({
			characterType: CharacterType.SHARK,
			roleType: RoleType.TARGET,
			hp: 0, // 죽음
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.NONE_CHARACTER_STATE,
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		const testPlayer3 = new User('player3Socket', '플레이어3');
		testPlayer3.id = 'player3';
		testPlayer3.setCharacter({
			characterType: CharacterType.MALANG,
			roleType: RoleType.TARGET,
			hp: 2,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.FLEA_MARKET_WAIT,
				nextState: CharacterStateType.FLEA_MARKET_TURN,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		// 방에 플레이어들 추가
		testRoom.users = [testPlayer1, testPlayer2, testPlayer3];

		// Mock 설정 업데이트
		(roomManger.getRoom as jest.Mock).mockImplementation(() => testRoom);
		(roomManger.getUserFromRoom as jest.Mock).mockImplementation(
			(roomId: number, userId: string) => {
				return testRoom.users.find((u) => u.id === userId);
			},
		);

		const testSocket = { userId: testPlayer1.id, roomId: testRoom.id } as GameSocket;
		const req: C2SFleaMarketPickRequest = { pickIndex: 0 };

		const res = fleaMarketPickUseCase(testSocket, req);

		expect(res.payload.oneofKind).toBe(GamePacketType.fleaMarketPickResponse);

		// 플레이어1은 WAIT, 플레이어3은 TURN (플레이어2 건너뛰기)
		expect(testPlayer1.character!.stateInfo!.state).toBe(CharacterStateType.FLEA_MARKET_WAIT);
		expect(testPlayer3.character!.stateInfo!.state).toBe(CharacterStateType.FLEA_MARKET_TURN);
		// 플레이어2는 여전히 죽은 상태
		expect(testPlayer2.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
	});

	/**
	 * 시나리오 5: 격리된 플레이어 건너뛰기 테스트
	 * - 플레이어2가 격리 상태(CONTAINED)일 때
	 * - 플레이어1이 카드를 선택하면 플레이어2를 건너뛰고 플레이어3에게 턴이 넘어가는지 확인
	 * - 격리된 플레이어의 상태는 변경되지 않는지 확인
	 */
	it('시나리오 5: 격리 상태인 플레이어는 플리마켓에서 제외되고 턴이 넘어가지 않는다', () => {
		// 완전히 새로운 room 객체 생성
		const testRoom = new Room(1, 'player1', '테스트방', 8, RoomStateType.INGAME, []);
		testRoom.fleaMarketPickIndex = [];
		testRoom.roomFleaMarketCards = [
			CardType.BBANG,
			CardType.SHIELD,
			CardType.VACCINE,
			CardType.BOMB,
		];

		// 플레이어들 재생성
		const testPlayer1 = new User('player1Socket', '플레이어1');
		testPlayer1.id = 'player1';
		testPlayer1.setCharacter({
			characterType: CharacterType.RED,
			roleType: RoleType.TARGET,
			hp: 4,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.FLEA_MARKET_TURN,
				nextState: CharacterStateType.FLEA_MARKET_WAIT,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		const testPlayer2 = new User('player2Socket', '플레이어2');
		testPlayer2.id = 'player2';
		testPlayer2.setCharacter({
			characterType: CharacterType.SHARK,
			roleType: RoleType.TARGET,
			hp: 3,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.CONTAINED, // 격리 상태
				nextState: CharacterStateType.NONE_CHARACTER_STATE,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		const testPlayer3 = new User('player3Socket', '플레이어3');
		testPlayer3.id = 'player3';
		testPlayer3.setCharacter({
			characterType: CharacterType.MALANG,
			roleType: RoleType.TARGET,
			hp: 2,
			weapon: 0,
			stateInfo: {
				state: CharacterStateType.FLEA_MARKET_WAIT,
				nextState: CharacterStateType.FLEA_MARKET_TURN,
				nextStateAt: '0',
				stateTargetUserId: '0',
			},
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});

		// 방에 플레이어들 추가
		testRoom.users = [testPlayer1, testPlayer2, testPlayer3];

		// Mock 설정 업데이트
		(roomManger.getRoom as jest.Mock).mockImplementation(() => testRoom);
		(roomManger.getUserFromRoom as jest.Mock).mockImplementation(
			(roomId: number, userId: string) => {
				return testRoom.users.find((u) => u.id === userId);
			},
		);

		const testSocket = { userId: testPlayer1.id, roomId: testRoom.id } as GameSocket;
		const req: C2SFleaMarketPickRequest = { pickIndex: 0 };

		const res = fleaMarketPickUseCase(testSocket, req);

		expect(res.payload.oneofKind).toBe(GamePacketType.fleaMarketPickResponse);

		// 플레이어1은 WAIT, 플레이어3은 TURN (격리된 플레이어2 건너뛰기)
		expect(testPlayer1.character!.stateInfo!.state).toBe(CharacterStateType.FLEA_MARKET_WAIT);
		expect(testPlayer3.character!.stateInfo!.state).toBe(CharacterStateType.FLEA_MARKET_TURN);
		// 플레이어2는 여전히 격리 상태
		expect(testPlayer2.character!.stateInfo!.state).toBe(CharacterStateType.CONTAINED);
	});
});
