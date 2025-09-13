import { GameSocket } from '../../../type/game.socket';
import { GamePacket } from '../../../generated/gamePacket';
import { getGamePacketType } from '../../../utils/type.converter';
import { getRooms } from '../../../utils/redis.util';
import getRoomListResponseHandler from '../../response/get.room.list.response.handler';
import getRoomListRequestHandler from '../get.room.list.request.handler';
import { Room } from '../../../models/room.model';
import { RoomStateType } from '../../../generated/common/enums';

jest.mock('../../../utils/type.converter');
jest.mock('../../../utils/redis.util');
jest.mock('../../response/get.room.list.response.handler');

const mockGetGamePacketType = getGamePacketType as jest.Mock;
const mockGetRooms = getRooms as jest.Mock;
const mockGetRoomListResponseHandler = getRoomListResponseHandler as jest.Mock;

describe('getRoomListRequestHandler', () => {
  let mockSocket: Partial<GameSocket>;
  let mockPacket: GamePacket;

  beforeEach(() => {
    jest.resetAllMocks();
    mockSocket = { userId: '1' };
    mockPacket = {
      payload: {
        oneofKind: 'getRoomListRequest',
        getRoomListRequest: {},
      },
    };
    mockGetGamePacketType.mockReturnValue(mockPacket.payload);
  });

  it('방 목록이 있으면 방 목록을 응답으로 보낸다', async () => {
    const mockRooms: Room[] = [
      { id: 1, ownerId: '1', name:'Room1', maxUserNum:4, state:RoomStateType.WAIT, users:[]},
      { id: 2, ownerId: '2', name:'Room2', maxUserNum:4, state:RoomStateType.WAIT, users:[]},
    ];
    mockGetRooms.mockResolvedValue(mockRooms);

    await getRoomListRequestHandler(mockSocket as GameSocket, mockPacket);

    expect(mockGetRooms).toHaveBeenCalled();
    expect(mockGetRoomListResponseHandler).toHaveBeenCalledWith(
      mockSocket,
      expect.objectContaining({
        payload: {
          oneofKind: 'getRoomListResponse',
          getRoomListResponse: {
            rooms: mockRooms,
          },
        },
      }),
    );
  });

  it('방 목록이 없으면 빈 목록을 응답으로 보낸다', async () => {
    mockGetRooms.mockResolvedValue([]);

    await getRoomListRequestHandler(mockSocket as GameSocket, mockPacket);

    expect(mockGetRooms).toHaveBeenCalled();
    expect(mockGetRoomListResponseHandler).toHaveBeenCalledWith(
      mockSocket,
      expect.objectContaining({
        payload: {
          oneofKind: 'getRoomListResponse',
          getRoomListResponse: {
            rooms: [],
          },
        },
      }),
    );
  });

  it('소켓에 유저 아이디가 없으면 아무것도 하지 않는다', async () => {
    mockSocket.userId = undefined;

    await getRoomListRequestHandler(mockSocket as GameSocket, mockPacket);

    expect(mockGetRooms).not.toHaveBeenCalled();
    expect(mockGetRoomListResponseHandler).not.toHaveBeenCalled();
  });

  it('요청 패킷이 없으면 아무것도 하지 않는다', async () => {
    mockGetGamePacketType.mockReturnValue(undefined);

    await getRoomListRequestHandler(mockSocket as GameSocket, mockPacket);

    expect(mockGetRooms).not.toHaveBeenCalled();
    expect(mockGetRoomListResponseHandler).not.toHaveBeenCalled();
  });
});
