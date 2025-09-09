import leaveRoomRequestHandler, { setLeaveRoomResponse } from '../leave.room.request.handler';
import { GameSocket } from '../../../type/game.socket';
import { GamePacket } from '../../../generated/gamePacket';
import { GlobalFailCode, RoomStateType } from '../../../generated/common/enums';
import { deleteRoom, getRoom, removeUserFromRoom, saveRoom } from '../../../utils/redis.util';
import leaveRoomResponseHandler from '../../response/leave.room.response.handler';
import leaveRoomNotificationHandler from '../../notification/leave.room.notification.handler';
import { getGamePacketType } from '../../../utils/type.converter';
import { Room } from '../../../models/room.model';
import { User } from '../../../models/user.model';
import { GamePacketType, gamePackTypeSelect } from '../../../enums/gamePacketType';

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

	it('방장이 방을 나갈 때, 남은 유저에게 방장 권한이 위임되고 saveRoom이 호출되어야 한다', async () => {
		// 준비
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
		const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0); // 첫 번째 남은 유저(user456)가 새 방장이 되도록 모킹

		// 실행
		await leaveRoomRequestHandler(socket, gamePacket);

		// 검증
		expect(mockGetRoom).toHaveBeenCalledWith(1);
		expect(mockSaveRoom).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 1,
				ownerId: 'user456',
				users: [{ id: 'user456', nickname: 'user2' }],
			}),
		);
		expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(
			socket,
			setLeaveRoomResponse(true, GlobalFailCode.NONE_FAILCODE),
		);
		expect(mockLeaveRoomNotificationHandler).toHaveBeenCalledWith(socket, gamePacket);
		randomSpy.mockRestore();
	});

	it('방장이 방을 나갈 때, 남은 유저가 없으면 방이 삭제되어야 한다', async () => {
		// 준비
		const users = [{ id: 'user123', nickname: 'owner' }];
		const initialRoom: Room = {
			id: 1,
			ownerId: 'user123',
			name: 'Test Room',
			maxUserNum: 4,
			state: RoomStateType.WAIT,
			users: users,
		};

		mockGetRoom.mockResolvedValue(initialRoom);

		// 실행
		await leaveRoomRequestHandler(socket, gamePacket);

		// 검증
		expect(mockGetRoom).toHaveBeenCalledWith(1);
		expect(mockDeleteRoom).toHaveBeenCalledWith(1);
		expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(
			socket,
			setLeaveRoomResponse(true, GlobalFailCode.NONE_FAILCODE),
		);
		expect(mockLeaveRoomNotificationHandler).not.toHaveBeenCalled();
	});

	// 기존의 통과했던 테스트 케이스들은 유지합니다.
	it('소켓에 userId나 roomId가 없으면 INVALID_REQUEST 응답 전송', async () => {
		socket.userId = undefined;
		await leaveRoomRequestHandler(socket, gamePacket);
		expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(
			socket,
			setLeaveRoomResponse(false, GlobalFailCode.INVALID_REQUEST),
		);
		expect(mockGetRoom).not.toHaveBeenCalled();
	});

	it('존재하지 않는 방 에러 발생 시 ROOM_NOT_FOUND 응답 전송', async () => {
		mockGetRoom.mockResolvedValue(null);
		await leaveRoomRequestHandler(socket, gamePacket);
		expect(mockGetRoom).toHaveBeenCalledWith(socket.roomId);
		expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(
			socket,
			setLeaveRoomResponse(false, GlobalFailCode.ROOM_NOT_FOUND),
		);
	});

	it('유저 삭제 중 일반 에러 발생 시 UNKNOWN_ERROR 응답 전송', async () => {
		const error = new Error('Some other Redis error');
		mockRemoveUserFromRoom.mockRejectedValue(error);

		// 실행
		await leaveRoomRequestHandler(socket, gamePacket);

		// 검증
		// 기존 코드: expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(socket, GlobalFailCode.UNKNOWN_ERROR);
		// 수정된 코드:
		expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(
			socket,
			expect.objectContaining({
				payload: expect.objectContaining({
					oneofKind: 'leaveRoomResponse',
					leaveRoomResponse: expect.objectContaining({
						success: false,
						failCode: GlobalFailCode.UNKNOWN_ERROR,
					}),
				}),
			}),
		);
	});
});
