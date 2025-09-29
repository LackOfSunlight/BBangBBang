import joinRandomRoomUseCase from './join.random.room.usecase';
import { C2SJoinRandomRoomRequest } from '../../Generated/packet/room_actions';
import { GameSocket } from '../../Type/game.socket';
import { getUserByUserId } from '../../Services/prisma.service';
import { addUserToRoom, getRooms } from '../../Utils/room.utils';
import { broadcastDataToRoom } from '../../Sockets/notification';
import { GamePacketType } from '../../Enums/gamePacketType';
import { GlobalFailCode, RoomStateType } from '../../Generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';

jest.mock('../../services/prisma.service');
jest.mock('../../utils/room.utils');
jest.mock('../../utils/notification.util');

describe('joinRandomRoomUseCase', () => {
	let mockSocket: Partial<GameSocket>;
	let mockRequest: C2SJoinRandomRoomRequest;
	let mockUserInfo: { id: number; nickname: string };
	let mockRooms: Room[];

	beforeEach(() => {
		mockSocket = { userId: '1' };
		mockRequest = {};
		mockUserInfo = { id: 1, nickname: 'testUser' };
		mockRooms = [
			new Room(1, 'host1', 'FullRoom', 2, RoomStateType.WAIT, [
				new User('u1', 'p1'),
				new User('u2', 'p2'),
			]),
			new Room(2, 'host2', 'AvailableRoom', 4, RoomStateType.WAIT, [new User('u3', 'p3')]),
		];

		(getUserByUserId as jest.Mock).mockResolvedValue(mockUserInfo);
		(getRooms as jest.Mock).mockReturnValue(mockRooms);
		(addUserToRoom as jest.Mock).mockImplementation(() => {});
		(broadcastDataToRoom as jest.Mock).mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('사용 가능한 방에 성공적으로 참가해야 함', async () => {
		const response = await joinRandomRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(getRooms).toHaveBeenCalled();
		expect(addUserToRoom).toHaveBeenCalledWith(2, expect.any(User));
		expect(broadcastDataToRoom).toHaveBeenCalled();
		expect(response.payload.oneofKind).toBe(GamePacketType.joinRandomRoomResponse);

		if (response.payload.oneofKind === 'joinRandomRoomResponse') {
			const resPayload = response.payload.joinRandomRoomResponse;
			expect(resPayload.success).toBe(true);
			expect(resPayload.failCode).toBe(GlobalFailCode.NONE_FAILCODE);
			expect(resPayload.room).toBeDefined();
			expect(resPayload.room?.id).toBe(2);
		}
	});

	it('사용 가능한 방이 없으면 실패해야 함', async () => {
		(getRooms as jest.Mock).mockReturnValue([
			new Room(1, 'host1', 'FullRoom', 2, RoomStateType.WAIT, [
				new User('u1', 'p1'),
				new User('u2', 'p2'),
			]),
		]);
		const response = await joinRandomRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(addUserToRoom).not.toHaveBeenCalled();
		expect(broadcastDataToRoom).not.toHaveBeenCalled();
		expect(response.payload.oneofKind).toBe(GamePacketType.joinRandomRoomResponse);
		if (response.payload.oneofKind === 'joinRandomRoomResponse') {
			const resPayload = response.payload.joinRandomRoomResponse;
			expect(resPayload.success).toBe(false);
			expect(resPayload.failCode).toBe(GlobalFailCode.JOIN_ROOM_FAILED);
			expect(resPayload.room).toBeUndefined();
		}
	});

	it('유저 정보를 찾을 수 없으면 실패해야 함', async () => {
		(getUserByUserId as jest.Mock).mockResolvedValue(null);
		const response = await joinRandomRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(getRooms).not.toHaveBeenCalled();
		expect(response.payload.oneofKind).toBe(GamePacketType.joinRandomRoomResponse);
		if (response.payload.oneofKind === 'joinRandomRoomResponse') {
			const resPayload = response.payload.joinRandomRoomResponse;
			expect(resPayload.success).toBe(false);
			expect(resPayload.failCode).toBe(GlobalFailCode.JOIN_ROOM_FAILED);
		}
	});

	it('DB 에러 발생 시 실패해야 함', async () => {
		(getUserByUserId as jest.Mock).mockRejectedValue(new Error('DB Error'));
		const response = await joinRandomRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(response.payload.oneofKind).toBe(GamePacketType.joinRandomRoomResponse);
		if (response.payload.oneofKind === 'joinRandomRoomResponse') {
			const resPayload = response.payload.joinRandomRoomResponse;
			expect(resPayload.success).toBe(false);
			expect(resPayload.failCode).toBe(GlobalFailCode.JOIN_ROOM_FAILED);
		}
	});
});
