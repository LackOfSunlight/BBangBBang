import { GameSocket } from '../../type/game.socket';
import { createRoomDB, getUserByUserId } from '../../services/prisma.service';
import { gamePackTypeSelect } from '../../enums/gamePacketType';
import { RoomStateType } from '../../generated/common/enums';
import roomManager from '../../managers/room.manager';
import createRoomUseCase from '../create.room/create.room.usecase';
import getRoomListUseCase from './get.room.list.usecase';
import { getGamePacketType } from '../../converter/type.form';

// 외부 의존성만 모의 처리합니다.
jest.mock('../../services/prisma.service');

describe('getRoomListUseCase', () => {
	const mockOwnerInfo1 = { id: 1, nickname: 'owner1' };
	const mockOwnerInfo2 = { id: 2, nickname: 'owner2' };

	beforeEach(() => {
		// 실제 roomManager의 상태를 초기화합니다.
		roomManager.getRooms().forEach((room) => roomManager.deleteRoom(room.id));
		jest.clearAllMocks();

		// DB Mock 설정
		(getUserByUserId as jest.Mock).mockImplementation(async (userId: number) => {
			if (userId === 1) return mockOwnerInfo1;
			if (userId === 2) return mockOwnerInfo2;
			return null;
		});
		(createRoomDB as jest.Mock).mockImplementation(async (socket, req) => {
			const newId = (roomManager.getRooms().length || 0) + 1;
			return { id: newId, ownerId: socket.userId, name: req.name, maxUserNum: req.maxUserNum, state: RoomStateType.WAIT };
		});
	});

	it('성공: 방이 여러 개 있을 때, 전체 방 목록을 반환한다', async () => {
		// 설정: 2개의 방을 생성합니다.
		const socket1 = { userId: '1' } as GameSocket;
		await createRoomUseCase(socket1, { name: 'Room 1', maxUserNum: 4 });
		const socket2 = { userId: '2' } as GameSocket;
		await createRoomUseCase(socket2, { name: 'Room 2', maxUserNum: 8 });

		// 확인: 방이 2개 생성되었는지 확인합니다.
		expect(roomManager.getRooms().length).toBe(2);

		// 실행: 방 목록 조회를 요청합니다.
		const responsePacket = getRoomListUseCase({} as GameSocket, {});
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.getRoomListResponse);
		expect(payload).toBeDefined();
		if (!payload) return;
		const { getRoomListResponse } = payload;

		// 검증: 반환된 목록에 2개의 방 정보가 정확히 들어있는지 확인합니다.
		expect(getRoomListResponse.rooms).toBeDefined();
		expect(getRoomListResponse.rooms.length).toBe(2);
		expect(getRoomListResponse.rooms[0].name).toBe('Room 1');
		expect(getRoomListResponse.rooms[1].name).toBe('Room 2');
		expect(getRoomListResponse.rooms[1].maxUserNum).toBe(8);
	});

	it('성공: 방이 하나도 없을 때, 빈 배열을 반환한다', () => {
		// 설정: 방이 없는 상태입니다. (beforeEach에서 초기화됨)
		expect(roomManager.getRooms().length).toBe(0);

		// 실행: 방 목록 조회를 요청합니다.
		const responsePacket = getRoomListUseCase({} as GameSocket, {});
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.getRoomListResponse);
		expect(payload).toBeDefined();
		if (!payload) return;
		const { getRoomListResponse } = payload;

		// 검증: 빈 배열을 반환하는지 확인합니다.
		expect(getRoomListResponse.rooms).toBeDefined();
		expect(getRoomListResponse.rooms.length).toBe(0);
	});
});