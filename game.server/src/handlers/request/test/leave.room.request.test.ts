import leaveRoomRequestHandler, { setLeaveRoomResponse } from '../leave.room.request.handler';
import { GameSocket } from '../../../type/game.socket';
import { GamePacket } from '../../../generated/gamePacket';
import { GlobalFailCode, RoomStateType } from '../../../generated/common/enums';
import { deleteRoom, getRoom, removeUserFromRoom, saveRoom } from '../../../utils/redis.util';
import leaveRoomResponseHandler from '../../response/leave.room.response.handler';
import leaveRoomNotificationHandler from '../../notification/leave.room.notification.handler';
import { getGamePacketType } from '../../../utils/type.converter';
import { Room } from '../../../models/room.model';
import { GamePacketType } from '../../../enums/gamePacketType';
import { broadcastDataToRoom } from '../../../utils/notification.util';

// redis.util 모킹
jest.mock('../../../utils/redis.util', () => ({
	__esModule: true,
	getRoom: jest.fn(),
	removeUserFromRoom: jest.fn(),
	saveRoom: jest.fn(),
	deleteRoom: jest.fn(),
}));

// 핸들러 함수들 모킹
jest.mock('../../response/leave.room.response.handler', () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.mock('../../notification/leave.room.notification.handler', () => ({
	__esModule: true,
	default: jest.fn(),
}));

// notification.util 모킹
jest.mock('../../../utils/notification.util', () => ({
	__esModule: true,
	broadcastDataToRoom: jest.fn(),
}));

// 유틸 함수 모킹
jest.mock('../../../utils/type.converter');

describe('leaveRoomRequestHandler', () => {
	let socket: GameSocket;
	let gamePacket: GamePacket;

	// 모킹된 함수들
	const mockGetRoom = getRoom as jest.Mock;
	const mockSaveRoom = saveRoom as jest.Mock;
	const mockDeleteRoom = deleteRoom as jest.Mock;
	const mockLeaveRoomResponseHandler = leaveRoomResponseHandler as jest.Mock;
	const mockLeaveRoomNotificationHandler = leaveRoomNotificationHandler as jest.Mock;
	const mockGetGamePacketType = getGamePacketType as jest.Mock;
	const mockRemoveUserFromRoom = removeUserFromRoom as jest.Mock;
	const mockBroadcastDataToRoom = broadcastDataToRoom as jest.Mock;

	beforeEach(() => {
		socket = {
			userId: 'user123',
			roomId: 1,
		} as GameSocket;

		gamePacket = {
			payload: {
				oneofKind: GamePacketType.leaveRoomRequest,
				leaveRoomRequest: {},
			},
		} as GamePacket;

		mockGetGamePacketType.mockReturnValue({ leaveRoomRequest: {} });
		jest.clearAllMocks();
	});

	// --- 수정된 테스트 케이스 ---

	it('방장이 아닌 유저가 방을 나갈 때, 유저가 올바르게 제거되고 응답과 알림이 전송되어야 한다', async () => {
		// 준비
		const users = [
			{ id: 'user123', nickname: 'user1' },
			{ id: 'user456', nickname: 'user2' },
			{ id: 'user789', nickname: 'user3' },
		];
		const initialRoom: Room = {
			id: 1,
			ownerId: 'user456',
			name: 'Test Room',
			maxUserNum: 4,
			state: RoomStateType.WAIT,
			users: users,
		};
		const updatedUsers = [
			{ id: 'user456', nickname: 'user2' },
			{ id: 'user789', nickname: 'user3' },
		];

		mockGetRoom.mockResolvedValue(initialRoom);

		// 실행
		await leaveRoomRequestHandler(socket, gamePacket);

		// 검증
		expect(mockGetRoom).toHaveBeenCalledWith(1);
		expect(mockSaveRoom).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 1,
				ownerId: 'user456',
				users: updatedUsers,
			}),
		);
		expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(
			socket,
			setLeaveRoomResponse(true, GlobalFailCode.NONE_FAILCODE),
		);
		expect(mockLeaveRoomNotificationHandler).toHaveBeenCalledWith(socket, gamePacket);
	});

	// 방장이 나가는 경우 (남은 유저가 있을 때)의 테스트 케이스
	it('방장이 방을 나갈 때, 남은 유저가 있어도 방이 삭제되어야 한다', async () => {
		// 테스트를 위한 초기 방 및 유저 데이터
		const users = [
			{ id: 'user123', nickname: 'owner' },
			{ id: 'user456', nickname: 'user2' },
		];
		const initialRoom: Room = {
			id: 1,
			ownerId: 'user123',
			name: 'Test Room',
			maxUserNum: 4,
			state: RoomStateType.WAIT,
			users: users,
		};

		mockGetRoom.mockResolvedValue(initialRoom);
		mockRemoveUserFromRoom.mockResolvedValue(true);

		// 실행
		await leaveRoomRequestHandler(socket, gamePacket);

		// 검증
		expect(mockGetRoom).toHaveBeenCalledWith(1);

		// 모든 유저가 방에서 제거되는지 확인
		expect(mockRemoveUserFromRoom).toHaveBeenCalledTimes(users.length);
		for (const user of users) {
			expect(mockRemoveUserFromRoom).toHaveBeenCalledWith(initialRoom.id, user.id);
		}

		expect(mockDeleteRoom).toHaveBeenCalledWith(1);
		expect(mockSaveRoom).not.toHaveBeenCalled();

		// 모든 유저에게 방 삭제 응답이 broadcast 되는지 확인
		const expectedPacket = setLeaveRoomResponse(true, GlobalFailCode.NONE_FAILCODE);
		expect(mockBroadcastDataToRoom).toHaveBeenCalledWith(
			users,
			expectedPacket,
			GamePacketType.leaveRoomResponse,
		);

		// 개별 응답/알림 핸들러는 호출되지 않아야 함
		expect(mockLeaveRoomResponseHandler).not.toHaveBeenCalled();
		expect(mockLeaveRoomNotificationHandler).not.toHaveBeenCalled();
	});

	// 소켓에 유저ID 또는 방ID가 없는 경우의 테스트 케이스
	it('소켓에 userId나 roomId가 없으면 INVALID_REQUEST 응답 전송', async () => {
		// 소켓의 userId를 undefined로 설정하여 유효하지 않은 요청을 시뮬레이션
		socket.userId = undefined;
		await leaveRoomRequestHandler(socket, gamePacket);
		// INVALID_REQUEST 응답이 전송되었는지 검증
		expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(
			socket,
			setLeaveRoomResponse(false, GlobalFailCode.INVALID_REQUEST),
		);
		// getRoom 함수가 호출되지 않았는지 검증
		expect(mockGetRoom).not.toHaveBeenCalled();
	});

	// 존재하지 않는 방 에러 발생 시의 테스트 케이스
	it('존재하지 않는 방 에러 발생 시 ROOM_NOT_FOUND 응답 전송', async () => {
		mockGetRoom.mockResolvedValue(null);
		await leaveRoomRequestHandler(socket, gamePacket);
		// getRoom 함수가 호출되었는지 검증
		expect(mockGetRoom).toHaveBeenCalledWith(socket.roomId);
		// ROOM_NOT_FOUND 응답이 전송되었는지 검증
		expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(
			socket,
			setLeaveRoomResponse(false, GlobalFailCode.ROOM_NOT_FOUND),
		);
	});

	// 방 정보 저장/삭제 중 일반 에러 발생 시의 테스트 케이스
	it('방 정보 저장/삭제 중 일반 에러 발생 시 UNKNOWN_ERROR 응답 전송', async () => {
		// 테스트를 위한 초기 방 데이터
		const users = [{ id: 'user123', nickname: 'user1' }];
		const initialRoom: Room = {
			id: 1,
			ownerId: 'user456',
			name: 'Test Room',
			maxUserNum: 4,
			state: RoomStateType.WAIT,
			users: users,
		};

		// getRoom mock 함수가 초기 방 데이터를 반환하도록 설정
		mockGetRoom.mockResolvedValue(initialRoom);
		const error = new Error('Some other Redis error');
		mockSaveRoom.mockRejectedValue(error); // saveRoom 호출 시 에러를 발생시키도록 모킹

		// 실행
		await leaveRoomRequestHandler(socket, gamePacket);

		// getRoom 및 saveRoom 함수가 호출되었는지 검증
		expect(mockGetRoom).toHaveBeenCalledWith(1);
		expect(mockSaveRoom).toHaveBeenCalled();
		// UNKNOWN_ERROR 응답이 전송되었는지 검증
		expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(
			socket,
			setLeaveRoomResponse(false, GlobalFailCode.UNKNOWN_ERROR),
		);
	});
});
