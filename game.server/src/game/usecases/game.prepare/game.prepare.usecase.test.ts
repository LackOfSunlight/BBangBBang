import { gamePrepareUseCase } from './game.prepare.usecase';
import { GameSocket } from '@common/types/game.socket';
import { C2SGamePrepareRequest } from '@core/generated/packet/game_actions';
import { GamePacketType } from '@game/enums/gamePacketType';
import { GlobalFailCode, RoleType, CharacterStateType, RoomStateType } from '@core/generated/common/enums';
import { Room } from '@game/models/room.model';
import { User } from '@game/models/user.model';
import roomManger from '@game/managers/room.manager';

jest.mock('../../managers/room.manager');

function createRoomWithUsers(count: number): Room {
	const users: User[] = [] as any;
	for (let i = 0; i < count; i++) {
		const u = new User(`socket-${i}`, `user-${i}`) as any as User;
		u.id = `user-${i}`;
		users.push(u);
	}
	const room = new Room(1, users[0].id, 'prepare-room', count, RoomStateType.WAIT, users) as any as Room;
	(room as any).toData = jest.fn(() => ({ users: users.map((u) => u.toData()) }));
	return room;
}

describe('gamePrepareUseCase', () => {
	let socket: GameSocket;

	beforeEach(() => {
		jest.clearAllMocks();
		socket = { roomId: 1, userId: 'user-0' } as any;
	});

	it('각 유저에게 역할과 캐릭터를 할당하고 방 상태를 INGAME으로 설정한다', () => {
		const room = createRoomWithUsers(4);
		(roomManger.getRoom as jest.Mock).mockReturnValue(room);
		const req = { isNewRoom: false } as unknown as C2SGamePrepareRequest;

		const res = gamePrepareUseCase(socket, req);
		expect(res.payload.oneofKind).toBe(GamePacketType.gamePrepareResponse);
		if (res.payload.oneofKind === GamePacketType.gamePrepareResponse) {
			expect(res.payload.gamePrepareResponse.success).toBe(true);
			expect(res.payload.gamePrepareResponse.failCode).toBe(GlobalFailCode.NONE_FAILCODE);
		}

		// 모든 유저가 캐릭터 데이터를 가지고 있는지
		room.users.forEach((u) => {
			expect(u.character).toBeTruthy();
			expect(u.character!.stateInfo.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		});

		// 방 상태가 INGAME으로 변경되었는지
		expect(room.state).toBe(RoomStateType.INGAME);
	});
});
