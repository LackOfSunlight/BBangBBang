// import createRoomRequestHandler from '../create.room.request.handler';
// import { GameSocket } from '../../../type/game.socket';
// import { GamePacket } from '../../../generated/gamePacket';
// import { C2SCreateRoomRequest } from '../../../generated/packet/room_actions';
// import { getGamePacketType } from '../../../utils/type.converter';
// import createRoomResponseHandler from '../../response/create.room.response.handler';
// import { prisma } from '../../../utils/db';
// import { GlobalFailCode, RoomStateType } from '../../../generated/common/enums';
// import { Room } from '../../../models/room.model';
// import { User } from '../../../models/user.model';

// jest.mock('../../../utils/type.converter');
// jest.mock('../../response/create.room.response.handler');
// jest.mock('../../../utils/db', () => ({
//   prisma: {
//     room: {
//       create: jest.fn(),
//     },
//     user: {
//       findUnique: jest.fn(),
//     },
//   },
// }));

// const mockGetGamePacketType = getGamePacketType as jest.Mock;
// const mockCreateRoomResponseHandler = createRoomResponseHandler as jest.Mock;
// const mockPrismaRoomCreate = prisma.room.create as jest.Mock;
// const mockPrismaUserFindUnique = prisma.user.findUnique as jest.Mock;

// describe('createRoomRequestHandler', () => {
//   let mockSocket: Partial<GameSocket>;
//   let mockPacket: GamePacket;
//   let mockReq: C2SCreateRoomRequest;

//   beforeEach(() => {
//     jest.resetAllMocks();
//     mockSocket = { userId: '1', roomId: undefined };
//     mockReq = { name: 'Test Room', maxUserNum: 4 };
//     mockPacket = {
//       payload: {
//         oneofKind: 'createRoomRequest',
//         createRoomRequest: mockReq,
//       },
//     };
//     mockGetGamePacketType.mockReturnValue(mockPacket.payload);
//   });

//   it('방 생성 요청이 유효하면 방을 생성하고 성공 응답을 보낸다', async () => {
//     const mockDbRoom = { id: 101, ownerId: '1', name: 'Test Room', maxUserNum: 4, state: "WAIT" };
//     const mockDbUser = { id: 1, email:'test@naver.com', nickname:'test', password:'password', token: 'token', createAt: 'data'};
//     mockPrismaRoomCreate.mockResolvedValue(mockDbRoom);
//     mockPrismaUserFindUnique.mockResolvedValue(mockDbUser);

//     await createRoomRequestHandler(mockSocket as GameSocket, mockPacket);

//     expect(mockPrismaRoomCreate).toHaveBeenCalledWith({
//       data: {
//         ownerId: Number(mockSocket.userId),
//         name: mockReq.name,
//         maxUserNum: mockReq.maxUserNum,
//         state: "WAIT",
//       },
//     });

//     expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({ where: { id: Number(mockSocket.userId) } });

//     const expectedUser = new User(mockSocket.userId!, mockDbUser.nickname);
//     const expectedRoom = new Room(mockDbRoom.id, mockSocket.userId!, mockReq.name, mockReq.maxUserNum, RoomStateType.WAIT, [expectedUser]);

//     expect(mockSocket.roomId).toBe(mockDbRoom.id);
//     expect(mockCreateRoomResponseHandler).toHaveBeenCalledWith(
//       mockSocket,
//       expect.objectContaining({
//         payload: {
//           oneofKind: 'createRoomResponse',
//           createRoomResponse: {
//             success: true,
//             failCode: GlobalFailCode.NONE_FAILCODE,
//             room: expectedRoom,
//           },
//         },
//       }),
//     );
//   });

//   it('방 이름이 없으면 실패 응답을 보낸다', async () => {
//     mockReq.name = '';

//     await createRoomRequestHandler(mockSocket as GameSocket, mockPacket);

//     expect(mockPrismaRoomCreate).not.toHaveBeenCalled();
//     expect(mockCreateRoomResponseHandler).toHaveBeenCalledWith(
//       mockSocket,
//       expect.objectContaining({
//         payload: {
//           oneofKind: "createRoomResponse",
//           createRoomResponse: {
//             success: false,
//             failCode: GlobalFailCode.CREATE_ROOM_FAILED,
//             room: undefined,
//           },
//         },
//       }),
//     );
//   });

//   it('유저 아이디가 없으면 실패 응답을 보낸다', async () => {
//     mockSocket.userId = undefined;

//     await createRoomRequestHandler(mockSocket as GameSocket, mockPacket);

//     expect(mockPrismaRoomCreate).not.toHaveBeenCalled();
//     expect(mockCreateRoomResponseHandler).toHaveBeenCalledWith(
//       mockSocket,
//       expect.objectContaining({
//         payload: {
//            oneofKind: "createRoomResponse",
//           createRoomResponse: {
//             success: false,
//             failCode: GlobalFailCode.CREATE_ROOM_FAILED,
//             room: undefined,
//           },
//         },
//       }),
//     );
//   });

//   it('DB에서 유저를 찾지 못하면 실패 응답을 보낸다', async () => {
//     const mockDbRoom = { id: '101', ownerId: 1, name: 'Test Room', maxUserNum: 4, state: 'WAIT' };
//     mockPrismaRoomCreate.mockResolvedValue(mockDbRoom);
//     mockPrismaUserFindUnique.mockResolvedValue(null);

//     await createRoomRequestHandler(mockSocket as GameSocket, mockPacket);

//     expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({ where: { id: Number(mockSocket.userId) } });
//     expect(mockCreateRoomResponseHandler).toHaveBeenCalledWith(
//       mockSocket,
//       expect.objectContaining({
//         payload: {
//           oneofKind: "createRoomResponse",
//           createRoomResponse: {
//             success: false,
//             failCode: GlobalFailCode.CREATE_ROOM_FAILED,
//             room: undefined
//           },
//         },
//       }),
//     );
//   });
// });
