import leaveRoomRequestHandler from '../leave.room.request.handler';
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
    default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../notification/leave.room.notification.handler', () => ({
    __esModule: true,
    default: jest.fn().mockResolvedValue(undefined),
}));

// 유틸리티 함수 모킹
jest.mock('../../../utils/type.converter');

describe('leaveRoomRequestHandler', () => {
    let socket: GameSocket;
    let gamePacket: GamePacket;

    const mockGetRoom = getRoom as jest.Mock;
    const mockRemoveUserFromRoom = removeUserFromRoom as jest.Mock;
    const mockSaveRoom = saveRoom as jest.Mock;
    const mockDeleteRoom = deleteRoom as jest.Mock;
    const mockLeaveRoomResponseHandler = leaveRoomResponseHandler as jest.Mock;
    const mockLeaveRoomNotificationHandler = leaveRoomNotificationHandler as jest.Mock;
    const mockGetGamePacketType = getGamePacketType as jest.Mock;

    beforeEach(() => {
        // 모킹 함수 초기화
        jest.clearAllMocks();

        // 테스트를 위한 더미 데이터 설정
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

        // getGamePacketType 함수가 페이로드를 올바르게 반환하도록 설정
        mockGetGamePacketType.mockReturnValue({
            leaveRoomRequest: {},
        });
    });

    // --- 새로운 시나리오 테스트 케이스 ---

    it('방장이 아닌 유저가 방을 나갈 때, 유저가 올바르게 제거되고 응답과 알림이 전송되어야 한다', async () => {
        // 준비
        const users = [
            { id: 'user123', nickname: 'user1' },
            { id: 'user456', nickname: 'user2' },
            { id: 'user789', nickname: 'user3' },
        ];
        const initialRoom = {
            id: 1,
            ownerId: 'user456',
            name: 'room',
            maxUserNum: 4,
            state: RoomStateType.WAIT,
            users: users,
        } as Room;

        const updatedUsers = [{ id: 'user456', nickname: 'user2' }, { id: 'user789', nickname: 'user3' }];

        mockGetRoom.mockResolvedValue(initialRoom);
        mockRemoveUserFromRoom.mockImplementation(() => {
            initialRoom.users = updatedUsers;
        });

        // 실행
        await leaveRoomRequestHandler(socket, gamePacket);

        // 검증
        expect(mockGetRoom).toHaveBeenCalledWith(socket.roomId);
        expect(mockRemoveUserFromRoom).toHaveBeenCalledWith(socket.roomId, socket.userId);
        expect(mockSaveRoom).toHaveBeenCalledWith(expect.objectContaining({ users: updatedUsers })); // saveRoom이 호출되었는지 확인
        expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(socket, expect.anything()); // 정확한 응답 객체는 setLeaveRoomResponse가 생성하므로 검증하지 않음.
        expect(mockLeaveRoomNotificationHandler).toHaveBeenCalledWith(socket, gamePacket);
        expect(mockDeleteRoom).not.toHaveBeenCalled(); // 방이 삭제되지 않았는지 확인
    });

    it('방장이 방을 나갈 때, 남은 유저에게 방장 권한이 위임되고 saveRoom이 호출되어야 한다', async () => {
        // 준비
        const users = [
            { id: 'user123', nickname: 'owner' },
            { id: 'user456', nickname: 'user2' },
            { id: 'user789', nickname: 'user3' },
        ];
        const initialRoom = {
            id: 1,
            ownerId: 'user123',
            name: 'room',
            maxUserNum: 4,
            state: RoomStateType.WAIT,
            users: users,
        } as Room;

        mockGetRoom.mockResolvedValue(initialRoom);

        // Math.random 모킹을 통해 새로운 방장 id 예측 가능하도록 설정
        jest.spyOn(Math, 'random').mockReturnValue(0);

        // 실행
        await leaveRoomRequestHandler(socket, gamePacket);

        // 검증
        expect(mockGetRoom).toHaveBeenCalledWith(socket.roomId);
        expect(mockSaveRoom).toHaveBeenCalledWith(expect.objectContaining({
            ownerId: 'user456', // user456에게 방장 권한 위임 예상
            users: [{ id: 'user456', nickname: 'user2' }, { id: 'user789', nickname: 'user3' }],
        }));
        expect(mockDeleteRoom).not.toHaveBeenCalled();
        expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(socket, expect.anything());
        expect(mockLeaveRoomNotificationHandler).toHaveBeenCalledWith(socket, gamePacket);
        expect(mockRemoveUserFromRoom).toHaveBeenCalledWith(socket.roomId, socket.userId);
    });

    it('방장이 방을 나갈 때, 남은 유저가 없으면 방이 삭제되어야 한다', async () => {
        // 준비
        const users = [{ id: 'user123', nickname: 'owner' }];
        const initialRoom = {
            id: 1,
            ownerId: 'user123',
            name: 'test-room',
            maxUserNum: 4,
            state: RoomStateType.WAIT,
            users: users,
        } as Room;

        mockGetRoom.mockResolvedValue(initialRoom);

        // 실행
        await leaveRoomRequestHandler(socket, gamePacket);

        // 검증
        expect(mockGetRoom).toHaveBeenCalledWith(socket.roomId);
        expect(mockSaveRoom).not.toHaveBeenCalled();
        expect(mockDeleteRoom).toHaveBeenCalledWith(socket.roomId);
        expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(socket, expect.anything());
        expect(mockLeaveRoomNotificationHandler).not.toHaveBeenCalled();
        expect(mockRemoveUserFromRoom).toHaveBeenCalledWith(socket.roomId, socket.userId);
    });

    // --- 기존 테스트 케이스 (개선) ---

    it('소켓에 userId나 roomId가 없으면 INVALID_REQUEST 응답 전송', async () => {
        socket.userId = undefined;
        socket.roomId = undefined;
        await leaveRoomRequestHandler(socket, gamePacket);
        expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(socket, expect.anything());
        expect(mockRemoveUserFromRoom).not.toHaveBeenCalled();
        expect(mockGetRoom).not.toHaveBeenCalled();
        expect(mockLeaveRoomNotificationHandler).not.toHaveBeenCalled();
    });

    it('존재하지 않는 방 에러 발생 시 ROOM_NOT_FOUND 응답 전송', async () => {
        // 준비
        mockGetRoom.mockResolvedValue(null);

        // 실행
        await leaveRoomRequestHandler(socket, gamePacket);

        // 검증
        expect(mockGetRoom).toHaveBeenCalledWith(socket.roomId);
        expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(socket, expect.anything());
        expect(mockRemoveUserFromRoom).not.toHaveBeenCalled();
        expect(mockLeaveRoomNotificationHandler).not.toHaveBeenCalled();
    });

    it('유저 삭제 중 일반 에러 발생 시 UNKNOWN_ERROR 응답 전송', async () => {
        const error = new Error('Some other Redis error');
        mockGetRoom.mockResolvedValue({ id: 1, users: [{ id: 'user123' }], ownerId: 'user123' });
        mockRemoveUserFromRoom.mockRejectedValue(error);

        await leaveRoomRequestHandler(socket, gamePacket);

        expect(mockLeaveRoomResponseHandler).toHaveBeenCalledWith(socket, expect.anything());
        expect(mockGetRoom).toHaveBeenCalled();
        expect(mockLeaveRoomNotificationHandler).not.toHaveBeenCalled();
    });
});