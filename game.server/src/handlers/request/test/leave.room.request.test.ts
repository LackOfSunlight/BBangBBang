import { GameSocket } from "../../../type/game.socket";
import { GamePacket } from "../../../generated/gamePacket";
import { GamePacketType } from "../../../enums/gamePacketType";
import { C2SLeaveRoomRequest } from "../../../generated/packet/room_actions";
import leaveRoomRequestHandler from "../leave.room.request.handler";
import * as redisUtil from "../../../utils/redis.util";
import leaveRoomResponseHandler from "../../response/leave.room.response.handler";
import * as notificationUtil from "../../../utils/notification.util";
import { getGamePacketType } from "../../../utils/type.converter";
import { GlobalFailCode } from "../../../generated/common/enums";

jest.mock('../../../utils/redis.util');
jest.mock('../../response/leave.room.response.handler');
jest.mock('../../../utils/notification.util');
jest.mock('../../../utils/type.converter');

describe('leaveRoomRequestHandler', () => {
    let socket: GameSocket;
    let gamePacket: GamePacket;

    beforeEach(() => {
        socket = {
            userId: 'testUser',
            roomId: 1,
        } as GameSocket;

        const leaveRoomRequest: C2SLeaveRoomRequest = {
            // In the current implementation, the request is empty
        };

        gamePacket = {
            payload: {
                oneofKind: GamePacketType.leaveRoomRequest,
                leaveRoomRequest: leaveRoomRequest,
            },
        };

        (getGamePacketType as jest.Mock).mockReturnValue(gamePacket.payload);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle a successful leave room request', async () => {
        const room = { id: 1, users: [{ id: 'anotherUser' }] };
        (redisUtil.removeUserFromRoom as jest.Mock).mockResolvedValue(undefined);
        (redisUtil.getRoom as jest.Mock).mockResolvedValue(room);

        await leaveRoomRequestHandler(socket, gamePacket);

        expect(redisUtil.removeUserFromRoom).toHaveBeenCalledWith(socket.roomId, socket.userId);
        expect(leaveRoomResponseHandler).toHaveBeenCalledWith(socket, expect.objectContaining({
            payload: {
                oneofKind: GamePacketType.leaveRoomResponse,
                leaveRoomResponse: {
                    success: true,
                    failCode: GlobalFailCode.NONE_FAILCODE,
                },
            },
        }));
        expect(notificationUtil.sendNotificationToRoom).toHaveBeenCalledWith(socket.roomId, expect.objectContaining({
            payload: {
                oneofKind: GamePacketType.leaveRoomNotification,
                leaveRoomNotification: {
                    userId: socket.userId,
                },
            },
        }));
        expect(socket.roomId).toBeUndefined();
    });

    it('should handle a failed leave room request', async () => {
        const error = new Error('Failed to remove user from room');
        (redisUtil.removeUserFromRoom as jest.Mock).mockRejectedValue(error);

        await leaveRoomRequestHandler(socket, gamePacket);

        expect(redisUtil.removeUserFromRoom).toHaveBeenCalledWith(socket.roomId, socket.userId);
        expect(leaveRoomResponseHandler).toHaveBeenCalledWith(socket, expect.objectContaining({
            payload: {
                oneofKind: GamePacketType.leaveRoomResponse,
                leaveRoomResponse: {
                    success: false,
                    failCode: GlobalFailCode.LEAVE_ROOM_FAILED,
                },
            },
        }));
        expect(notificationUtil.sendNotificationToRoom).not.toHaveBeenCalled();
        expect(socket.roomId).toBe(1); // Should not be changed
    });
});
