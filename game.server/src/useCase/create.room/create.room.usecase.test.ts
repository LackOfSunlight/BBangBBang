import createRoomUseCase from './create.room.usecase';
import { C2SCreateRoomRequest } from '../../Generated/packet/room_actions';
import { GameSocket } from '../../Type/game.socket';
import { createRoomDB, getUserByUserId } from '../../Services/prisma.service.js';
import { saveRoom } from '../../Utils/room.utils';
import { GamePacketType } from '../../Enums/gamePacketType.js';
import { GlobalFailCode, RoomStateType } from '../../Generated/common/enums.js';
import { Room } from '../../Models/room.model';

jest.mock('../../services/prisma.service.js');
jest.mock('../../utils/room.utils');

describe('createRoomUserCase', () => {
	let mockSocket: Partial<GameSocket>;
	let mockRequest: C2SCreateRoomRequest;

	const mockRoomDB = {
		id: 1,
		ownerId: '1',
		name: 'testRoom',
		maxUserNum: 4,
		state: RoomStateType.WAIT,
	};

	const mockUserInfo = {
		id: 1,
		email: 'test@example.com',
		nickname: 'testuser',
	};

	beforeEach(() => {
		mockSocket = {
			userId: '1',
			roomId: undefined,
		};
		mockRequest = {
			name: 'testRoom',
			maxUserNum: 4,
		};

		(createRoomDB as jest.Mock).mockResolvedValue(mockRoomDB);
		(getUserByUserId as jest.Mock).mockResolvedValue(mockUserInfo);
		(saveRoom as jest.Mock).mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('방 생성을 성공해야 함', async () => {
		const response = await createRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(createRoomDB).toHaveBeenCalledWith(mockSocket, mockRequest);
		expect(getUserByUserId).toHaveBeenCalledWith(Number(mockSocket.userId));
		expect(mockSocket.roomId).toBe(mockRoomDB.id);
		expect(saveRoom).toHaveBeenCalled();

		expect(response.payload.oneofKind).toBe(GamePacketType.createRoomResponse);
		if (response.payload.oneofKind === GamePacketType.createRoomResponse) {
			const createRoomResponse = response.payload.createRoomResponse;
			expect(createRoomResponse.success).toBe(true);
			expect(createRoomResponse.failCode).toBe(GlobalFailCode.NONE_FAILCODE);
			expect(createRoomResponse.room).toBeDefined();
			expect(createRoomResponse.room?.id).toBe(mockRoomDB.id);
		}
	});

	it('방 이름이 없으면 실패해야 함', async () => {
		mockRequest.name = '';
		const response = await createRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(response.payload.oneofKind).toBe(GamePacketType.createRoomResponse);
		if (response.payload.oneofKind === GamePacketType.createRoomResponse) {
			expect(response.payload.createRoomResponse.success).toBe(false);
			expect(response.payload.createRoomResponse.failCode).toBe(GlobalFailCode.CREATE_ROOM_FAILED);
		}
		expect(createRoomDB).not.toHaveBeenCalled();
	});

	it('userId가 없으면 실패해야 함', async () => {
		mockSocket.userId = undefined;
		const response = await createRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(response.payload.oneofKind).toBe(GamePacketType.createRoomResponse);
		if (response.payload.oneofKind === GamePacketType.createRoomResponse) {
			expect(response.payload.createRoomResponse.success).toBe(false);
			expect(response.payload.createRoomResponse.failCode).toBe(GlobalFailCode.CREATE_ROOM_FAILED);
		}
		expect(createRoomDB).not.toHaveBeenCalled();
	});

	it('createRoomDB에서 에러가 발생하면 실패해야 함', async () => {
		(createRoomDB as jest.Mock).mockRejectedValue(new Error('DB error'));

		const response = await createRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(response.payload.oneofKind).toBe(GamePacketType.createRoomResponse);
		if (response.payload.oneofKind === GamePacketType.createRoomResponse) {
			expect(response.payload.createRoomResponse.success).toBe(false);
			expect(response.payload.createRoomResponse.failCode).toBe(GlobalFailCode.CREATE_ROOM_FAILED);
		}
		expect(saveRoom).not.toHaveBeenCalled();
	});

	it('getUserDB에서 에러가 발생하면 실패해야 함', async () => {
		(getUserByUserId as jest.Mock).mockRejectedValue(new Error('DB error'));

		const response = await createRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(response.payload.oneofKind).toBe(GamePacketType.createRoomResponse);
		if (response.payload.oneofKind === GamePacketType.createRoomResponse) {
			expect(response.payload.createRoomResponse.success).toBe(false);
			expect(response.payload.createRoomResponse.failCode).toBe(GlobalFailCode.CREATE_ROOM_FAILED);
		}
		expect(saveRoom).not.toHaveBeenCalled();
	});

	it('roomDB나 userInfo가 없으면 실패해야 함', async () => {
		(createRoomDB as jest.Mock).mockResolvedValue(null);

		const response = await createRoomUseCase(mockSocket as GameSocket, mockRequest);

		expect(response.payload.oneofKind).toBe(GamePacketType.createRoomResponse);
		if (response.payload.oneofKind === GamePacketType.createRoomResponse) {
			expect(response.payload.createRoomResponse.success).toBe(false);
			expect(response.payload.createRoomResponse.failCode).toBe(GlobalFailCode.CREATE_ROOM_FAILED);
		}
		expect(saveRoom).not.toHaveBeenCalled();
	});
});
