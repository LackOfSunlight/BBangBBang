import joinRoomUseCase from './join.room.usecase';
import { C2SJoinRoomRequest } from '../../generated/packet/room_actions';
import { GameSocket } from '../../Type/game.socket';
import { getUserByEmail, getUserByUserId } from '../../Services/prisma.service';
import { addUserToRoom, getRoom } from '../../Utils/room.utils';
import { broadcastDataToRoom } from '../../Sockets/notification';
import { GamePacketType } from '../../Enums/gamePacketType';
import { GlobalFailCode, RoomStateType } from '../../generated/common/enums';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';

jest.mock('../../services/prisma.service');
jest.mock('../../utils/room.utils');
jest.mock('../../utils/notification.util');

describe('joinRoomUseCase', () => {
	let mockSocket: Partial<GameSocket>;
	let mockRequest: C2SJoinRoomRequest;
	let mockUserInfo: { id: number; email: string; nickname: string };
	let mockRoom: Room;

	beforeEach(() => {
		mockSocket = { userId: '1', roomId: undefined };
		mockRequest = { roomId: 1 };
		mockUserInfo = { id: 1, email: 'test@naver.com', nickname: 'testUser' };
		mockRoom = new Room(1, '2', 'testRoom', 4, RoomStateType.WAIT, [new User('2', 'hostUser')]);

		(getUserByUserId as jest.Mock).mockResolvedValue(mockUserInfo);
		(getRoom as jest.Mock).mockReturnValue(mockRoom);
		(addUserToRoom as jest.Mock).mockImplementation(() => {});
		(broadcastDataToRoom as jest.Mock).mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('방 입장을 성공해야 함', async () => {
		const response = await joinRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(getUserByUserId).toHaveBeenCalledWith(Number(mockSocket.userId));
		expect(getRoom).toHaveBeenCalledWith(mockRequest.roomId);
		expect(addUserToRoom).toHaveBeenCalledWith(mockRequest.roomId, expect.any(User));
		expect(mockSocket.roomId).toBe(mockRequest.roomId);
		expect(broadcastDataToRoom).toHaveBeenCalled();
		expect(response.payload.oneofKind).toBe(GamePacketType.joinRoomResponse);
		if (response.payload.oneofKind === 'joinRoomResponse') {
			expect(response.payload.joinRoomResponse.success).toBe(true);
			expect(response.payload.joinRoomResponse.failCode).toBe(GlobalFailCode.NONE_FAILCODE);
		}
	});

	it('방이 없으면 실패해야 함', async () => {
		(getRoom as jest.Mock).mockReturnValue(undefined);
		const response = await joinRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(response.payload.oneofKind).toBe(GamePacketType.joinRoomResponse);
		if (response.payload.oneofKind === 'joinRoomResponse') {
			expect(response.payload.joinRoomResponse.success).toBe(false);
			expect(response.payload.joinRoomResponse.failCode).toBe(GlobalFailCode.JOIN_ROOM_FAILED);
		}
	});

	it('유저 정보가 없으면 실패해야 함', async () => {
		(getUserByUserId as jest.Mock).mockResolvedValue(null);
		const response = await joinRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(response.payload.oneofKind).toBe(GamePacketType.joinRoomResponse);
		if (response.payload.oneofKind === 'joinRoomResponse') {
			expect(response.payload.joinRoomResponse.success).toBe(false);
			expect(response.payload.joinRoomResponse.failCode).toBe(GlobalFailCode.JOIN_ROOM_FAILED);
		}
	});

	it('방이 꽉 찼으면 실패해야 함', async () => {
		mockRoom.users = [
			new User('1', 'a'),
			new User('2', 'b'),
			new User('3', 'c'),
			new User('4', 'd'),
		];
		mockRoom.maxUserNum = 4;
		(getRoom as jest.Mock).mockReturnValue(mockRoom);

		const response = await joinRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(response.payload.oneofKind).toBe(GamePacketType.joinRoomResponse);
		if (response.payload.oneofKind === 'joinRoomResponse') {
			expect(response.payload.joinRoomResponse.success).toBe(false);
			expect(response.payload.joinRoomResponse.failCode).toBe(GlobalFailCode.JOIN_ROOM_FAILED);
		}
	});

	it('게임이 시작됐으면 실패해야 함', async () => {
		mockRoom.state = RoomStateType.INGAME;
		(getRoom as jest.Mock).mockReturnValue(mockRoom);

		const response = await joinRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(response.payload.oneofKind).toBe(GamePacketType.joinRoomResponse);
		if (response.payload.oneofKind === 'joinRoomResponse') {
			expect(response.payload.joinRoomResponse.success).toBe(false);
			expect(response.payload.joinRoomResponse.failCode).toBe(GlobalFailCode.JOIN_ROOM_FAILED);
		}
	});

	it('DB 에러가 발생하면 실패해야 함', async () => {
		(getUserByUserId as jest.Mock).mockRejectedValue(new Error('DB Error'));
		const response = await joinRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(response.payload.oneofKind).toBe(GamePacketType.joinRoomResponse);
		if (response.payload.oneofKind === 'joinRoomResponse') {
			expect(response.payload.joinRoomResponse.success).toBe(false);
			expect(response.payload.joinRoomResponse.failCode).toBe(GlobalFailCode.JOIN_ROOM_FAILED);
		}
	});
});
