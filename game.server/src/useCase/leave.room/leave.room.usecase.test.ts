import { GamePacketType } from '../../enums/gamePacketType';
import { GlobalFailCode, RoomStateType } from '../../generated/common/enums';
import { C2SLeaveRoomRequest } from '../../generated/packet/room_actions';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { GameSocket } from '../../type/game.socket';
import { broadcastDataToRoom } from '../../utils/notification.util';
import { deleteRoom, getRoom, removeUserFromRoom } from '../../utils/room.utils';
import { leaveRoomUseCase } from './leave.room.usecase';

// 의존성 Mock 처리
jest.mock('../../utils/room.utils');
jest.mock('../../utils/notification.util');

// Mock 함수
const mockGetRoom = getRoom as jest.Mock;
const mockDeleteRoom = deleteRoom as jest.Mock;
const mockRemoveUserFromRoom = removeUserFromRoom as jest.Mock;
const mockBroadcastDataToRoom = broadcastDataToRoom as jest.Mock;

describe('leaveRoomUseCase', () => {
	let mockSocket: GameSocket;
	const mockReq: C2SLeaveRoomRequest = {};

	// 테스트용 유저 객체
	const owner = new User('owner-1', 'Owner');
	const user2 = new User('user-2', 'User2');
	const user3 = new User('user-3', 'User3');

	beforeEach(() => {
		jest.clearAllMocks();
		// 테스트용 기본 소켓 객체. GameSocket 타입의 모든 속성을 만족시키기 위해 as 사용
		mockSocket = { userId: 'some-user', roomId: 1 } as GameSocket;
	});

	// --- 유효성 검사 테스트 --- //

	it('소켓에 roomId가 없으면 INVALID_REQUEST를 반환해야 한다', async () => {
		mockSocket.roomId = undefined;
		const result = await leaveRoomUseCase(mockSocket, mockReq);

		expect(result.payload.oneofKind).toBe('leaveRoomResponse');
		if (result.payload.oneofKind === 'leaveRoomResponse') {
			expect(result.payload.leaveRoomResponse.failCode).toBe(GlobalFailCode.INVALID_REQUEST);
		}
	});

	it('getRoom이 null을 반환하면 ROOM_NOT_FOUND를 반환해야 한다', async () => {
		mockGetRoom.mockReturnValue(null);
		const result = await leaveRoomUseCase(mockSocket, mockReq);

		expect(result.payload.oneofKind).toBe('leaveRoomResponse');
		if (result.payload.oneofKind === 'leaveRoomResponse') {
			expect(result.payload.leaveRoomResponse.failCode).toBe(GlobalFailCode.ROOM_NOT_FOUND);
		}
	});

	it('유저가 해당 방의 멤버가 아니면 INVALID_REQUEST를 반환해야 한다', async () => {
		const mockRoom = new Room(1, owner.id, 'Test Room', 8, RoomStateType.WAIT, []);
		mockRoom.users.push(owner); // mockSocket.userId('some-user')는 이 방에 없음
		mockGetRoom.mockReturnValue(mockRoom);

		const result = await leaveRoomUseCase(mockSocket, mockReq);

		expect(result.payload.oneofKind).toBe('leaveRoomResponse');
		if (result.payload.oneofKind === 'leaveRoomResponse') {
			expect(result.payload.leaveRoomResponse.failCode).toBe(GlobalFailCode.INVALID_REQUEST);
		}
	});

	// --- 방장 퇴장 시나리오 --- //

	describe('방장이 방을 나갈 때', () => {
		it('성공적으로 방을 삭제하고 모든 유저에게 알림을 보내야 한다', async () => {
			// Arrange
			const usersInRoom = [owner, user2, user3];
			const mockRoom = new Room(1, owner.id, 'Test Room', 8, RoomStateType.WAIT, usersInRoom);
			mockSocket.userId = owner.id;
			mockGetRoom.mockReturnValue(mockRoom);

			// Act
			const result = await leaveRoomUseCase(mockSocket, mockReq);

			// Assert
			// 1. 방 삭제 함수가 올바른 roomId로 호출되었는지 확인
			expect(mockDeleteRoom).toHaveBeenCalledWith(1);
			expect(mockRemoveUserFromRoom).not.toHaveBeenCalled(); // 유저 개별 삭제는 호출되면 안 됨

			// 2. 방장을 제외한 모든 유저에게 방이 닫혔다는 알림을 보냈는지 확인
			expect(mockBroadcastDataToRoom).toHaveBeenCalledWith(
				usersInRoom, // 생성 시 사용한 배열과 동일한 참조를 사용
				expect.objectContaining({
					payload: {
						oneofKind: 'leaveRoomResponse',
						// leaveRoomResponse 내용을 실제 생성되는 패킷과 똑같이 맞춰줌
						leaveRoomResponse: { success: true, failCode: GlobalFailCode.NONE_FAILCODE },
					},
				}),
				GamePacketType.leaveRoomResponse,
				mockSocket, // 방장을 제외
			);

			// 3. 방장 본인에게는 성공 응답을 반환했는지 확인
			expect(result.payload.oneofKind).toBe('leaveRoomResponse');
			if (result.payload.oneofKind === 'leaveRoomResponse') {
				expect(result.payload.leaveRoomResponse.success).toBe(true);
			}

			// 4. 소켓의 상태가 올바르게 변경되었는지 확인
			expect(mockSocket.roomId).toBeUndefined();
		});
	});

	// --- 일반 유저 퇴장 시나리오 --- //

	describe('일반 유저가 방을 나갈 때', () => {
		beforeEach(() => {
			// 일반 유저(user2)가 나가는 상황으로 설정
			mockSocket.userId = user2.id;
			const mockRoom = new Room(1, owner.id, 'Test Room', 8, RoomStateType.WAIT, []);
			mockRoom.users.push(owner, user2, user3);
			mockGetRoom.mockReturnValue(mockRoom);
		});

		it('성공적으로 유저를 내보내고 남은 유저에게 알림을 보내야 한다', async () => {
			const result = await leaveRoomUseCase(mockSocket, mockReq);

			// 1. 유저 삭제 함수가 올바른 인자로 호출되었는지 확인
			expect(mockRemoveUserFromRoom).toHaveBeenCalledWith(1, user2.id);
			expect(mockDeleteRoom).not.toHaveBeenCalled(); // 방 전체 삭제는 호출되면 안 됨

			// 2. 남은 유저들에게 유저 퇴장 알림을 보냈는지 확인
			expect(mockBroadcastDataToRoom).toHaveBeenCalledWith(
				[owner, user3], // 남은 유저 목록
				expect.objectContaining({
					payload: {
						oneofKind: 'leaveRoomNotification',
						leaveRoomNotification: { userId: user2.id },
					},
				}),
				GamePacketType.leaveRoomNotification,
			);

			// 3. 나가는 유저 본인에게는 성공 응답을 반환했는지 확인
			expect(result.payload.oneofKind).toBe('leaveRoomResponse');
			if (result.payload.oneofKind === 'leaveRoomResponse') {
				expect(result.payload.leaveRoomResponse.success).toBe(true);
			}

			// 4. 소켓의 상태가 올바르게 변경되었는지 확인
			expect(mockSocket.roomId).toBeUndefined();
		});
	});

	// --- 에러 처리 테스트 --- //

	it('에러 발생 시 UNKNOWN_ERROR를 반환하고 소켓 상태를 롤백해야 한다', async () => {
		const originalRoomId = mockSocket.roomId;
		const error = new Error('DB Connection Failed');
		mockGetRoom.mockImplementation(() => {
			throw error;
		});

		// 테스트 중 console.error 출력을 막기 위해 mock 설정
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

		const result = await leaveRoomUseCase(mockSocket, mockReq);

		// mock 복원
		consoleErrorSpy.mockRestore();

		// 1. UNKNOWN_ERROR를 포함한 실패 응답을 반환했는지 확인
		expect(result.payload.oneofKind).toBe('leaveRoomResponse');
		if (result.payload.oneofKind === 'leaveRoomResponse') {
			expect(result.payload.leaveRoomResponse.failCode).toBe(GlobalFailCode.UNKNOWN_ERROR);
		}

		// 2. 소켓의 roomId가 원래대로 복구(롤백)되었는지 확인
		expect(mockSocket.roomId).toBe(originalRoomId);
	});
});
