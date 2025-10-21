import { GameSocket } from '@common/types/game.socket';
import { createRoomDB, getUserByUserId } from '@game/services/prisma.service';
import { gamePackTypeSelect } from '@game/enums/gamePacketType';
import { RoomStateType } from '@core/generated/common/enums';
import roomManager from '@game/managers/room.manager';
import createRoomUseCase from '../create.room/create.room.usecase';
import getRoomListUseCase from './get.room.list.usecase';
import { getGamePacketType } from '@common/converters/type.form';

// 외부 의존성만 모의 처리합니다.
jest.mock('../../services/prisma.service');

describe('getRoomListUseCase', () => {
	const mockOwnerInfo1 = { id: 1, nickname: 'owner1' };
	const mockOwnerInfo2 = { id: 2, nickname: 'owner2' };

	beforeEach(() => {
		roomManager.getRooms().forEach((room) => roomManager.deleteRoom(room.id));
		jest.clearAllMocks();

		(getUserByUserId as jest.Mock).mockImplementation(async (userId: number) => {
			if (userId === 1) return mockOwnerInfo1;
			if (userId === 2) return mockOwnerInfo2;
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
	});

	it('성공: 방이 여러 개 있을 때, 전체 방 목록을 반환한다', async () => {
		const socket1 = { userId: '1' } as GameSocket;
		await createRoomUseCase(socket1, { name: 'Room 1', maxUserNum: 4 });
		const socket2 = { userId: '2' } as GameSocket;
		await createRoomUseCase(socket2, { name: 'Room 2', maxUserNum: 8 });

		expect(roomManager.getRooms().length).toBe(2);

		const responsePacket = getRoomListUseCase({} as GameSocket, {});
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.getRoomListResponse);
		expect(payload).toBeDefined();
		if (!payload) return;
		const { getRoomListResponse } = payload;

		expect(getRoomListResponse.rooms).toBeDefined();
		expect(getRoomListResponse.rooms.length).toBe(2);
		expect(getRoomListResponse.rooms[0].name).toBe('Room 1');
		expect(getRoomListResponse.rooms[1].name).toBe('Room 2');
		expect(getRoomListResponse.rooms[1].maxUserNum).toBe(8);
	});

	it('성공: 방이 하나도 없을 때, 빈 배열을 반환한다', () => {
		expect(roomManager.getRooms().length).toBe(0);

		const responsePacket = getRoomListUseCase({} as GameSocket, {});
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.getRoomListResponse);
		expect(payload).toBeDefined();
		if (!payload) return;
		const { getRoomListResponse } = payload;

		expect(getRoomListResponse.rooms).toBeDefined();
		expect(getRoomListResponse.rooms.length).toBe(0);
	});
});
