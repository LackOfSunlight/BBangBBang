import { C2SCreateRoomRequest } from '../../generated/packet/room_actions';
import { GameSocket } from '../../type/game.socket';
import { createRoomDB, getUserByUserId } from '../../services/prisma.service';
import { gamePackTypeSelect } from '../../enums/gamePacketType';
import { GlobalFailCode, RoomStateType } from '../../generated/common/enums';
import roomManager from '../../managers/room.manager';
import createRoomUseCase from './create.room.usecase';
import { broadcastDataToRoom } from '../../sockets/notification';
import { getGamePacketType } from '../../converter/type.form';

// Mocks
jest.mock('../../services/prisma.service');
jest.mock('../../sockets/notification');
jest.mock('../../managers/room.manager');

describe('방생성 시나리오', () => {
	let mockSocket: GameSocket;
	const mockUserInfo = { id: 1, email: 'test@example.com', nickname: 'testuser' };
	const anotherUserInfo = { id: 2, email: 'test2@example.com', nickname: 'testuser2' };

	beforeEach(() => {
		jest.clearAllMocks();

		mockSocket = { userId: '1' } as GameSocket;

		(getUserByUserId as jest.Mock).mockImplementation((userId: number) => {
			if (userId === 1) return Promise.resolve(mockUserInfo);
			if (userId === 2) return Promise.resolve(anotherUserInfo);
			return Promise.resolve(null);
		});
		(broadcastDataToRoom as jest.Mock).mockImplementation(() => {});
	});

	describe('방 생성 (createRoomUseCase)', () => {
		beforeEach(() => {
			(createRoomDB as jest.Mock).mockResolvedValue({
				id: 1,
				ownerId: '1',
				name: 'Test Room',
				maxUserNum: 4,
				state: RoomStateType.WAIT,
			});
			(roomManager.saveRoom as jest.Mock).mockImplementation(() => {});
		});

		it('성공: 유저가 방을 성공적으로 생성한다', async () => {
			const req: C2SCreateRoomRequest = { name: 'Test Room', maxUserNum: 4 };
			const responsePacket = await createRoomUseCase(mockSocket, req);
			const payload = getGamePacketType(responsePacket, gamePackTypeSelect.createRoomResponse);
			expect(payload).toBeDefined();
			if (!payload) return;

			const { createRoomResponse } = payload;

			expect(createRoomDB).toHaveBeenCalled();
			expect(roomManager.saveRoom).toHaveBeenCalled();
			expect(mockSocket.roomId).toBe(1);
			expect(createRoomResponse.success).toBe(true);
		});

		it('실패: 방 이름이 없으면 실패한다', async () => {
			const req: C2SCreateRoomRequest = { name: '', maxUserNum: 4 };
			const responsePacket = await createRoomUseCase(mockSocket, req);
			const payload = getGamePacketType(responsePacket, gamePackTypeSelect.createRoomResponse);
			expect(payload).toBeDefined();
			if (!payload) return;

			const { createRoomResponse } = payload;

			expect(createRoomResponse.success).toBe(false);
			expect(createRoomResponse.failCode).toBe(GlobalFailCode.CREATE_ROOM_FAILED);
		});
	});
});
