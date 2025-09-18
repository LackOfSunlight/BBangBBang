// Mock dependencies
jest.mock('../../useCase/leave.room/leave.room.usecase');
jest.mock('../../utils/notification.util');
jest.mock('../../utils/send.data');
jest.mock('../../utils/redis.util'); // FIX: Mock redis utils to prevent open handles

import { GamePacketType } from '../../enums/gamePacketType';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { User } from '../../models/user.model';
import { GameSocket } from '../../type/game.socket';
import { leaveRoomUseCase } from '../../useCase/leave.room/leave.room.usecase';
import { broadcastDataToRoom } from '../../utils/notification.util';
import { sendData } from '../../utils/send.data';
import leaveRoomHandler from '../leave.room.handler';

// Mock implementations
const mockLeaveRoomUseCase = leaveRoomUseCase as jest.Mock;
const mockBroadcastDataToRoom = broadcastDataToRoom as jest.Mock;
const mockSendData = sendData as jest.Mock;

describe('leaveRoomHandler 테스트', () => {
	let mockSocket: Partial<GameSocket>;
	const mockGamePacket: GamePacket = { payload: { oneofKind: 'leaveRoomRequest', leaveRoomRequest: {} } };

	beforeEach(() => {
		jest.clearAllMocks();
		mockSocket = {
			userId: 'user-1',
			roomId: 1,
		};
	});

	it('userId가 없으면 INVALID_REQUEST 실패 응답을 보내야 합니다', async () => {
		mockSocket.userId = undefined;
		await leaveRoomHandler(mockSocket as GameSocket, mockGamePacket);
		expect(mockSendData).toHaveBeenCalledWith(
			mockSocket,
			expect.objectContaining({
				payload: {
					oneofKind: 'leaveRoomResponse',
					leaveRoomResponse: { success: false, failCode: GlobalFailCode.INVALID_REQUEST },
				},
			}),
			GamePacketType.leaveRoomResponse,
		);
		expect(mockLeaveRoomUseCase).not.toHaveBeenCalled();
	});

    it('roomId가 없으면 INVALID_REQUEST 실패 응답을 보내야 합니다', async () => {
		mockSocket.roomId = undefined;
		await leaveRoomHandler(mockSocket as GameSocket, mockGamePacket);
		expect(mockSendData).toHaveBeenCalledWith(
			mockSocket,
			expect.objectContaining({
				payload: {
					oneofKind: 'leaveRoomResponse',
					leaveRoomResponse: { success: false, failCode: GlobalFailCode.INVALID_REQUEST },
				},
			}),
			GamePacketType.leaveRoomResponse,
		);
		expect(mockLeaveRoomUseCase).not.toHaveBeenCalled();
	});

	it('일반 유저가 나갈 때 다른 유저들에게 알림을 전송해야 합니다', async () => {
		// Arrange
		const leavingUserId = 'user-1';
		const remainingUser = new User('user-2', 'user-2-nick');
		const roomId = 1;
        mockSocket.userId = leavingUserId;
		mockSocket.roomId = roomId;

		mockLeaveRoomUseCase.mockResolvedValue({
			response: { success: true, failCode: GlobalFailCode.NONE_FAILCODE },
			notification: {
				broadcastTargets: [remainingUser],
				leftUserId: leavingUserId,
				newOwnerId: remainingUser.id,
				roomDeleted: false,
			},
		});

		// Act
		await leaveRoomHandler(mockSocket as GameSocket, mockGamePacket);

		// Assert
		expect(mockLeaveRoomUseCase).toHaveBeenCalledWith({ userId: leavingUserId, roomId: roomId.toString() });
		
		expect(mockSendData).toHaveBeenCalledWith(
			mockSocket,
			expect.objectContaining({
				payload: {
					oneofKind: 'leaveRoomResponse',
					leaveRoomResponse: { success: true, failCode: GlobalFailCode.NONE_FAILCODE },
				},
			}),
			GamePacketType.leaveRoomResponse,
		);

		expect(mockBroadcastDataToRoom).toHaveBeenCalledWith(
			[remainingUser],
			expect.objectContaining({
				payload: {
					oneofKind: 'leaveRoomNotification',
					leaveRoomNotification: { userId: leavingUserId },
				},
			}),
			GamePacketType.leaveRoomNotification,
			mockSocket,
		);
	});

	it('방장이 나갈 때 모든 유저에게 방 삭제 응답을 전송해야 합니다', async () => {
		// Arrange
		const ownerId = 'owner-1';
		const otherUser = new User('user-2', 'user-2-nick');
		const allUsers = [new User(ownerId, 'owner-1-nick'), otherUser];
		const roomId = 1;
        mockSocket.userId = ownerId;
		mockSocket.roomId = roomId;

		mockLeaveRoomUseCase.mockResolvedValue({
			response: { success: true, failCode: GlobalFailCode.NONE_FAILCODE },
			notification: {
				broadcastTargets: allUsers,
				leftUserId: ownerId,
				newOwnerId: null,
				roomDeleted: true,
			},
		});

		// Act
		await leaveRoomHandler(mockSocket as GameSocket, mockGamePacket);

		// Assert
		expect(mockLeaveRoomUseCase).toHaveBeenCalledWith({ userId: ownerId, roomId: roomId.toString() });
		expect(mockSendData).not.toHaveBeenCalled();
		expect(mockBroadcastDataToRoom).toHaveBeenCalledWith(
			allUsers,
			expect.objectContaining({
				payload: {
					oneofKind: 'leaveRoomResponse',
					leaveRoomResponse: { success: true, failCode: GlobalFailCode.NONE_FAILCODE },
				},
			}),
			GamePacketType.leaveRoomResponse
		);
	});

    it('유즈케이스가 실패하면 실패 응답을 보내야 합니다', async () => {
        const roomId = 1;
        mockSocket.roomId = roomId;
		mockLeaveRoomUseCase.mockResolvedValue({
			response: { success: false, failCode: GlobalFailCode.ROOM_NOT_FOUND },
            notification: undefined
		});

		await leaveRoomHandler(mockSocket as GameSocket, mockGamePacket);

		expect(mockSendData).toHaveBeenCalledWith(
			mockSocket,
			expect.objectContaining({
				payload: {
					oneofKind: 'leaveRoomResponse',
					leaveRoomResponse: { success: false, failCode: GlobalFailCode.ROOM_NOT_FOUND },
				},
			}),
			GamePacketType.leaveRoomResponse,
		);
        expect(mockBroadcastDataToRoom).not.toHaveBeenCalled();
	});
});