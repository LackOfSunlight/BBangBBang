import { C2SJoinRoomRequest } from '@core/generated/packet/room_actions';
import { GameSocket } from '@common/types/game.socket';
import { createRoomDB, getUserByUserId } from '@game/services/prisma.service';
import { gamePackTypeSelect } from '@game/enums/gamePacketType';
import { GlobalFailCode, RoomStateType } from '@core/generated/common/enums';
import roomManager from '@game/managers/room.manager';
import createRoomUseCase from '../create.room/create.room.usecase';
import joinRoomUseCase from './join.room.usecase';
import { getGamePacketType } from '@common/converters/type.form';
import { broadcastDataToRoom } from '@core/network/sockets/notification';

// 외부 의존성만 모의 처리합니다.
jest.mock('../../services/prisma.service');
jest.mock('../../sockets/notification');

describe('joinRoomUseCase', () => {
	const mockOwnerInfo = { id: 1, nickname: 'owner' };
	const mockJoinerInfo = { id: 2, nickname: 'joiner' };
	const mockJoinerInfo2 = { id: 3, nickname: 'joiner2' };

	beforeEach(() => {
		// 실제 roomManager의 상태를 초기화합니다.
		roomManager.getRooms().forEach((room) => roomManager.deleteRoom(room.id));
		jest.clearAllMocks();

		// DB 및 소켓 통신 Mock을 설정합니다.
		(getUserByUserId as jest.Mock).mockImplementation(async (userId: number) => {
			if (userId === 1) return mockOwnerInfo;
			if (userId === 2) return mockJoinerInfo;
			if (userId === 3) return mockJoinerInfo2;
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

	// 테스트용 방을 생성하는 헬퍼 함수
	const createTestRoom = async (options: { name?: string; maxUserNum?: number } = {}) => {
		const ownerSocket = { userId: '1' } as GameSocket;
		await createRoomUseCase(ownerSocket, {
			name: options.name || 'Test Room',
			maxUserNum: options.maxUserNum || 4,
		});
	};

	it('성공: 유저가 대기중인 방에 성공적으로 참여한다', async () => {
		await createTestRoom();
		const joinerSocket = { userId: '2' } as GameSocket;
		const req: C2SJoinRoomRequest = { roomId: 1 };

		const responsePacket = await joinRoomUseCase(joinerSocket, req);
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.joinRoomResponse);
		expect(payload).toBeDefined();
		if (!payload) return;
		const { joinRoomResponse } = payload;

		expect(joinRoomResponse.success).toBe(true);
		expect(joinerSocket.roomId).toBe(1);
		const room = roomManager.getRoom(1);
		expect(room.users.length).toBe(2);
		expect(room.users.find((u) => u.id === '2')).toBeDefined();
	});

	it('실패: 방을 찾을 수 없을 때 실패한다', async () => {
		const joinerSocket = { userId: '2' } as GameSocket;
		const req: C2SJoinRoomRequest = { roomId: 999 }; // 존재하지 않는 방 ID

		const responsePacket = await joinRoomUseCase(joinerSocket, req);
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.joinRoomResponse);
		expect(payload).toBeDefined();
		if (!payload) return;
		const { joinRoomResponse } = payload;

		expect(joinRoomResponse.success).toBe(false);
		// 참고: 현재 roomManager.getRoom()은 방을 못찾으면 에러를 throw합니다.
		// joinRoomUseCase는 이 에러를 catch하여 UNKNOWN_ERROR를 반환하고 있습니다.
		expect(joinRoomResponse.failCode).toBe(GlobalFailCode.UNKNOWN_ERROR);
	});

	it('실패: 방이 꽉 찼을 때 실패한다', async () => {
		// 설정: maxUserNum:2인 방을 만들고 2명을 채운다.
		await createTestRoom({ maxUserNum: 2 });
		const joinerSocket1 = { userId: '2' } as GameSocket;
		await joinRoomUseCase(joinerSocket1, { roomId: 1 });
		expect(roomManager.getRoom(1).users.length).toBe(2);

		// 실행: 세 번째 유저가 참여 시도
		const joinerSocket2 = { userId: '3' } as GameSocket;
		const req: C2SJoinRoomRequest = { roomId: 1 };

		const responsePacket = await joinRoomUseCase(joinerSocket2, req);
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.joinRoomResponse);
		expect(payload).toBeDefined();
		if (!payload) return;
		const { joinRoomResponse } = payload;

		// 검증: 실패
		expect(joinRoomResponse.success).toBe(false);
		expect(joinRoomResponse.failCode).toBe(GlobalFailCode.JOIN_ROOM_FAILED);
	});

	it('실패: 방이 게임 중일 때 실패한다', async () => {
		await createTestRoom();
		const room = roomManager.getRoom(1);
		room.state = RoomStateType.INGAME; // 테스트를 위해 상태를 직접 변경

		const joinerSocket = { userId: '2' } as GameSocket;
		const req: C2SJoinRoomRequest = { roomId: 1 };

		const responsePacket = await joinRoomUseCase(joinerSocket, req);
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.joinRoomResponse);
		expect(payload).toBeDefined();
		if (!payload) return;
		const { joinRoomResponse } = payload;

		expect(joinRoomResponse.success).toBe(false);
		expect(joinRoomResponse.failCode).toBe(GlobalFailCode.JOIN_ROOM_FAILED);
	});

	it('실패: 유저 정보를 찾을 수 없을 때 실패한다', async () => {
		await createTestRoom();
		const joinerSocket = { userId: '999' } as GameSocket; // 존재하지 않는 유저 ID
		const req: C2SJoinRoomRequest = { roomId: 1 };

		const responsePacket = await joinRoomUseCase(joinerSocket, req);
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.joinRoomResponse);
		expect(payload).toBeDefined();
		if (!payload) return;
		const { joinRoomResponse } = payload;

		expect(joinRoomResponse.success).toBe(false);
		expect(joinRoomResponse.failCode).toBe(GlobalFailCode.CHARACTER_NOT_FOUND);
	});
});
