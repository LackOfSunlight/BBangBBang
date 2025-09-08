import { GameSocket } from '../../../type/game.socket';
import { GamePacket } from '../../../generated/gamePacket';
import { GamePacketType } from '../../../enums/gamePacketType';
import { GlobalFailCode } from '../../../generated/common/enums';
import { getRoom, removeUserFromRoom } from '../../../utils/redis.util';
import leaveRoomResponseHandler from '../../response/leave.room.response.handler';
import leaveRoomNotificationHandler from '../../notification/leave.room.notification.handler';
import { getGamePacketType } from '../../../utils/type.converter';
import { Room } from '../../../models/room.model';
import { User } from '../../../models/user.model';
import leaveRoomRequestHandler from '../leave.room.request.handler';

// --- Mocking Strategy Change ---
// 모듈에서 사용하는 함수를 명시적으로 모킹합니다.
jest.mock('../../../utils/redis.util', () => ({
	__esModule: true,
	getRoom: jest.fn(),
	removeUserFromRoom: jest.fn(),
}));

jest.mock('../../../utils/type.converter');

// 비동기 핸들러들을 async mock 함수로 모킹합니다.
jest.mock('../../response/leave.room.response.handler', () => ({
	__esModule: true,
	default: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../notification/leave.room.notification.handler', () => ({
	__esModule: true,
	default: jest.fn().mockResolvedValue(undefined),
}));

describe('leaveRoomRequestHandler', () => {
	let socket: GameSocket;
	let gamePacket: GamePacket;

	// 모킹된 함수들 (새로운 방식)
	const mockGetRoom = getRoom as jest.Mock;
	const mockRemoveUserFromRoom = removeUserFromRoom as jest.Mock;
	const mockLeaveRoomResponseHandler = leaveRoomResponseHandler as jest.Mock;
	const mockLeaveRoomNotificationHandler = leaveRoomNotificationHandler as jest.Mock;
	const mockGetGamePacketType = getGamePacketType as jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		socket = { userId: 'user123', roomId: 1 } as GameSocket;
		gamePacket = {
			payload: {
				oneofKind: GamePacketType.leaveRoomRequest,
				leaveRoomRequest: {},
			},
		};
		mockGetGamePacketType.mockReturnValue(gamePacket.payload);
	});

	it('방 나가기 성공 및 다른 유저에게 알림 전송', async () => {
		const remainingUser: User = {
			id: 'user456',
			nickname: 'test',
			character: 1,
			position: 1,
			isReady: false,
		};
		const updatedRoom: Room = {
			id: 1,
			name: 'Test Room',
			users: [remainingUser],
			maxUserNum: 4,
			isPrivate: false,
			password: '',
		};
		mockRemoveUserFromRoom.mockResolvedValue(undefined);
		mockGetRoom.mockResolvedValue(updatedRoom);

		await leaveRoomRequestHandler(socket, gamePacket);

		expect(mockRemoveUserFromRoom).toHaveBeenCalledWith(1, 'user123');
		expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(socket, GlobalFailCode.NONE_FAILCODE);
		expect(mockGetRoom).toHaveBeenCalledWith(1);
		expect(mockLeaveRoomNotificationHandler).toHaveBeenCalledWith(socket, updatedRoom);
	});

	it('소켓에 userId나 roomId가 없으면 INVALID_REQUEST 응답 전송', async () => {
		socket.userId = undefined;
		await leaveRoomRequestHandler(socket, gamePacket);
		expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(
			socket,
			GlobalFailCode.INVALID_REQUEST,
		);
		expect(mockRemoveUserFromRoom).not.toHaveBeenCalled();
	});

	// FAILING TEST CASE - NOW WITH MORE ROBUST MOCKING
	it('존재하지 않는 방 에러 발생 시 ROOM_NOT_FOUND 응답 전송', async () => {
		// 준비
		const error = new Error('Room not found');
		mockRemoveUserFromRoom.mockRejectedValue(error);

		// 실행
		await leaveRoomRequestHandler(socket, gamePacket);

		// 검증
		expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(
			socket,
			GlobalFailCode.ROOM_NOT_FOUND,
		);
	});

	it('유저 삭제 중 일반 에러 발생 시 UNKNOWN_ERROR 응답 전송', async () => {
		const error = new Error('Some other Redis error');
		mockRemoveUserFromRoom.mockRejectedValue(error);

		await leaveRoomRequestHandler(socket, gamePacket);

		expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(socket, GlobalFailCode.UNKNOWN_ERROR);
		expect(mockGetRoom).not.toHaveBeenCalled();
		expect(mockLeaveRoomNotificationHandler).not.toHaveBeenCalled();
	});
});
