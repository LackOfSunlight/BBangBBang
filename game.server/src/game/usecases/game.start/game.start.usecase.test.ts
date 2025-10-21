import { GameSocket } from '@common/types/game.socket';
import { C2SGameStartRequest } from '@core/generated/packet/game_actions';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import { GlobalFailCode, RoomStateType, CardType } from '@core/generated/common/enums';
import { GamePacketType } from '@game/enums/gamePacketType';
import roomManger from '@game/managers/room.manager';
import { broadcastDataToRoom } from '@core/network/sockets/notification';
import { shuffle } from '@common/utils/shuffle.util';
import gameManager, { notificationCharacterPosition } from '@game/managers/game.manager';
import { gameStartUseCase } from './game.start.usecase';

// Mocks
jest.mock('../../managers/room.manager');
jest.mock('../../sockets/notification', () => ({
	broadcastDataToRoom: jest.fn(),
}));
jest.mock('../../utils/shuffle.util', () => ({
	shuffle: jest.fn((arr: any) => arr),
}));
jest.mock('../../managers/game.manager', () => ({
	__esModule: true,
	default: { startGame: jest.fn() },
	notificationCharacterPosition: new Map(),
}));

function createRoomWithUsers(count: number): Room {
	const users: User[] = [] as any;
	for (let i = 0; i < count; i++) {
		const u = new User(`socket-${i}`, `user-${i}`) as any as User;
		u.id = `user-${i}`;
		u.setCharacter({
			characterType: 0,
			roleType: 0,
			hp: 4,
			weapon: 0,
			stateInfo: { state: 0, nextState: 0, nextStateAt: '0', stateTargetUserId: '0' },
			equips: [],
			debuffs: [],
			handCards: [],
			bbangCount: 0,
			handCardsCount: 0,
		});
		users.push(u);
	}
	const room = new Room(1, users[0].id, 'start-room', count, RoomStateType.WAIT, users) as any as Room;
	(room as any).toData = jest.fn(() => ({ users: users.map((u) => u.toData()) }));
	(room as any).initializeDeck = jest.fn(() => {});
	(room as any).drawDeck = jest.fn((n: number) => new Array(n).fill(CardType.BBANG));
	return room;
}

describe('gameStartUseCase', () => {
	let socket: GameSocket;

	beforeEach(() => {
		jest.clearAllMocks();
		(notificationCharacterPosition as any).clear?.();
		socket = { roomId: 1, userId: 'user-0' } as any;
	});

	it('성공 시 위치 맵 초기화 및 알림 전송', async () => {
		const room = createRoomWithUsers(3);
		(roomManger.getRoom as jest.Mock).mockReturnValue(room);
		const res = await gameStartUseCase(socket, {} as C2SGameStartRequest);
		expect(res.payload.oneofKind).toBe(GamePacketType.gameStartResponse);
		if (res.payload.oneofKind === GamePacketType.gameStartResponse) {
			expect(res.payload.gameStartResponse.success).toBe(true);
			expect(res.payload.gameStartResponse.failCode).toBe(GlobalFailCode.NONE_FAILCODE);
		}

		// 위치 맵 생성 확인
		const map = notificationCharacterPosition.get(room.id);
		expect(map).toBeTruthy();
		// 각 유저 위치가 기록되었는지 (간단 체크)
		room.users.forEach((u) => {
			expect(map?.get(u.id)).toBeTruthy();
		});
	});
});
