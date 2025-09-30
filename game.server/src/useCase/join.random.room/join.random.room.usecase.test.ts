import { GameSocket } from '../../type/game.socket';
import { createRoomDB, getUserByUserId } from '../../services/prisma.service';
import { broadcastDataToRoom } from '../../sockets/notification';
import { gamePackTypeSelect } from '../../enums/gamePacketType';
import { GlobalFailCode, RoomStateType } from '../../generated/common/enums';
import roomManager from '../../managers/room.manager';
import joinRandomRoomUseCase from './join.random.room.usecase';
import createRoomUseCase from '../create.room/create.room.usecase';
import { getGamePacketType } from '../../converter/type.form';

// 외부 의존성만 모의 처리합니다.
jest.mock('../../services/prisma.service');
jest.mock('../../sockets/notification');

describe('joinRandomRoomUseCase', () => {
	let mockSocket: GameSocket;
	const mockUserInfo = { id: 1, nickname: 'testUser' };
	const mockOwnerInfo = { id: 99, nickname: 'owner' };

	beforeEach(() => {
		// 실제 roomManager의 상태를 초기화합니다.
		roomManager.getRooms().forEach((room) => roomManager.deleteRoom(room.id));
		jest.clearAllMocks();

		mockSocket = { userId: '1' } as GameSocket;

		// DB Mock 설정
		(getUserByUserId as jest.Mock).mockImplementation(async (userId: number) => {
			if (userId === 1) return mockUserInfo;
			if (userId === 99) return mockOwnerInfo;
			return null;
		});
		(createRoomDB as jest.Mock).mockImplementation(async (socket, req) => {
			const newId = (roomManager.getRooms().length || 0) + 1;
			return {
				id: newId,
				ownerId: socket.userId,
				name: req.name,
				maxUserNum: req.maxUserNum,
				state: RoomStateType.WAIT,
			};
		});
		(broadcastDataToRoom as jest.Mock).mockImplementation(() => {});
	});

	it('성공: 참여 가능한 방이 있을 때 무작위로 참여한다', async () => {
		// 설정: 참여 가능한 방을 roomManager에 추가
		const ownerSocket = { userId: '99' } as GameSocket;
		await createRoomUseCase(ownerSocket, { name: 'Available Room', maxUserNum: 4 });

		const responsePacket = await joinRandomRoomUseCase(mockSocket, {});
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.joinRandomRoomResponse);
		expect(payload).toBeDefined();
		if (!payload) return;

		const { joinRandomRoomResponse } = payload;

		expect(joinRandomRoomResponse.success).toBe(true);
		expect(mockSocket.roomId).toBe(1);
		expect(roomManager.getRoom(1).users.length).toBe(2);
	});

	it('실패: 참여 가능한 방이 없을 때 실패한다', async () => {
		// 설정: 꽉 찬 방만 생성
		const ownerSocket = { userId: '99' } as GameSocket;
		await createRoomUseCase(ownerSocket, { name: 'Full Room', maxUserNum: 1 });

		const responsePacket = await joinRandomRoomUseCase(mockSocket, {});
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.joinRandomRoomResponse);
		expect(payload).toBeDefined();
		if (!payload) return;

		const { joinRandomRoomResponse } = payload;

		expect(joinRandomRoomResponse.success).toBe(false);
		expect(joinRandomRoomResponse.failCode).toBe(GlobalFailCode.JOIN_ROOM_FAILED);
	});

	it('실패: 유저 정보를 찾을 수 없으면 실패한다', async () => {
		(getUserByUserId as jest.Mock).mockResolvedValue(null);

		const responsePacket = await joinRandomRoomUseCase(mockSocket, {});
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.joinRandomRoomResponse);
		expect(payload).toBeDefined();
		if (!payload) return;

		const { joinRandomRoomResponse } = payload;

		expect(joinRandomRoomResponse.success).toBe(false);
		expect(joinRandomRoomResponse.failCode).toBe(GlobalFailCode.CHARACTER_NOT_FOUND);
	});
});
