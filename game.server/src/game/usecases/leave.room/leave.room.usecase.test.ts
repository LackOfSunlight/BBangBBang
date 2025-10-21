import { GameSocket } from '@common/types/game.socket';
import { createRoomDB, getUserByUserId } from '@game/services/prisma.service';
import { gamePackTypeSelect } from '@game/enums/gamePacketType';
import { GlobalFailCode, RoomStateType } from '@core/generated/common/enums';
import roomManager from '@game/managers/room.manager';
import createRoomUseCase from '../create.room/create.room.usecase';
import joinRoomUseCase from '../join.room/join.room.usecase';
import { leaveRoomUseCase } from './leave.room.usecase';
import { getGamePacketType } from '@common/converters/type.form';
import { broadcastDataToRoom } from '@core/network/sockets/notification';

// 외부 의존성만 모의 처리합니다.
jest.mock('../../services/prisma.service');
jest.mock('../../sockets/notification');

describe('leaveRoomUseCase', () => {
	const mockOwnerInfo = { id: 1, nickname: 'owner' };
	const mockJoinerInfo = { id: 2, nickname: 'joiner' };

	beforeEach(() => {
		// 실제 roomManager의 상태를 초기화합니다.
		roomManager.getRooms().forEach((room) => roomManager.deleteRoom(room.id));
		jest.clearAllMocks();

		// DB 및 소켓 통신 Mock을 설정합니다.
		(getUserByUserId as jest.Mock).mockImplementation(async (userId: number) => {
			if (userId === 1) return mockOwnerInfo;
			if (userId === 2) return mockJoinerInfo;
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

	// 테스트용 방을 생성하고 유저를 참여시키는 헬퍼 함수
	const setupPopulatedRoom = async () => {
		const ownerSocket = { userId: '1' } as GameSocket;
		await createRoomUseCase(ownerSocket, { name: 'Test Room', maxUserNum: 4 });

		const joinerSocket = { userId: '2' } as GameSocket;
		await joinRoomUseCase(joinerSocket, { roomId: 1 });

		return { ownerSocket, joinerSocket };
	};

	it('성공: 일반 유저가 방을 나간다', async () => {
		const { joinerSocket } = await setupPopulatedRoom();

		// 확인: 초기 상태 (유저 2명)
		expect(roomManager.getRoom(1).users.length).toBe(2);

		// 실행: 일반 유저(joiner)가 방을 나감
		const responsePacket = await leaveRoomUseCase(joinerSocket, {});
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.leaveRoomResponse);
		expect(payload).toBeDefined();
		if (!payload) return;

		// 검증
		expect(payload.leaveRoomResponse.success).toBe(true);
		const room = roomManager.getRoom(1);
		expect(room.users.length).toBe(1);
		expect(room.users[0].id).toBe('1'); // 방장만 남았는지 확인
		expect(joinerSocket.roomId).toBeUndefined();
		expect(broadcastDataToRoom).toHaveBeenCalled();
	});

	it('성공: 방장이 방을 나가면 방이 삭제된다', async () => {
		const { ownerSocket } = await setupPopulatedRoom();

		// 확인: 초기 상태 (방 존재)
		expect(roomManager.getRoom(1)).toBeDefined();

		// 실행: 방장(owner)이 방을 나감
		const responsePacket = await leaveRoomUseCase(ownerSocket, {});
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.leaveRoomResponse);
		expect(payload).toBeDefined();
		if (!payload) return;

		// 검증
		expect(payload.leaveRoomResponse.success).toBe(true);
		expect(() => roomManager.getRoom(1)).toThrow('Room not found'); // 방이 삭제되어 에러 발생
		expect(ownerSocket.roomId).toBeUndefined();
	});

	it('실패: 유저가 어떤 방에도 속해있지 않으면 실패한다', async () => {
		const socket = { userId: '1' } as GameSocket; // roomId가 없음

		const responsePacket = await leaveRoomUseCase(socket, {});
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.leaveRoomResponse);
		expect(payload).toBeDefined();
		if (!payload) return;

		expect(payload.leaveRoomResponse.success).toBe(false);
		expect(payload.leaveRoomResponse.failCode).toBe(GlobalFailCode.INVALID_REQUEST);
	});

	it('실패: 존재하지 않는 방에서 나가려고 하면 실패한다', async () => {
		const socket = { userId: '1', roomId: 999 } as GameSocket; // 존재하지 않는 roomId

		const responsePacket = await leaveRoomUseCase(socket, {});
		const payload = getGamePacketType(responsePacket, gamePackTypeSelect.leaveRoomResponse);
		expect(payload).toBeDefined();
		if (!payload) return;

		// 참고: getRoom이 throw한 에러를 useCase가 catch하여 UNKNOWN_ERROR로 반환
		expect(payload.leaveRoomResponse.success).toBe(false);
		expect(payload.leaveRoomResponse.failCode).toBe(GlobalFailCode.UNKNOWN_ERROR);
	});
});
