// import loginRequestHandler from '../login.request.handler';
// import { GameSocket } from '../../../type/game.socket';
// import { GamePacket } from '../../../generated/gamePacket';
// import { C2SLoginRequest } from '../../../generated/packet/auth';
// import { GlobalFailCode } from '../../../generated/common/enums';
// import { UserData } from '../../../generated/common/types';
// import loginResponseHandler from '../../response/login.response.handler';
// import getUserData from '../../../services/login/get.user.data';
// import checkUserPassword from '../../../services/login/check.user.password';
// import setTokenService from '../../../services/login/set.token.service';
// import { addSocket } from '../../../managers/socket.manger';
// import { getGamePacketType } from '../../../utils/type.converter';

// // Mock dependencies
// jest.mock('../../../utils/type.converter');
// jest.mock('../../response/login.response.handler');
// jest.mock('../../../services/login.request.handler/get.user.data');
// jest.mock('../../../services/login.request.handler/check.user.password');
// jest.mock('../../../services/login.request.handler/set.token.service');
// jest.mock('../../../managers/socket.manger');

// const mockGetGamePacketType = getGamePacketType as jest.Mock;
// const mockLoginResponseHandler = loginResponseHandler as jest.Mock;
// const mockGetUserData = getUserData as jest.Mock;
// const mockCheckUserPassword = checkUserPassword as jest.Mock;
// const mockSetTokenService = setTokenService as jest.Mock;
// const mockAddSocket = addSocket as jest.Mock;

// describe('loginRequestHandler', () => {
//   let mockSocket: Partial<GameSocket>;
//   let mockPacket: GamePacket;
//   let mockReq: C2SLoginRequest;
//   let mockDbUser: any;

//   beforeEach(() => {
//     jest.resetAllMocks();

//     mockSocket = { userId: '1' };
//     mockReq = { email: 'test@example.com', password: 'password123' };
//     mockPacket = {
//       payload: {
//         oneofKind: 'loginRequest',
//         loginRequest: mockReq,
//       },
//     };
//     mockDbUser = {
//       id: 1,
//       email: 'test@example.com',
//       nickname: 'testuser',
//       password: 'hashedPassword',
//       token: null,
//     };

//     mockGetGamePacketType.mockReturnValue(mockPacket.payload);
//   });

//   it('로그인 정보가 유효하면 로그인 성공', async () => {
//     mockGetUserData.mockResolvedValue(mockDbUser);
//     mockCheckUserPassword.mockResolvedValue(true);
//     mockSetTokenService.mockResolvedValue('new-token');

//     await loginRequestHandler(mockSocket as GameSocket, mockPacket);

//     expect(mockGetUserData).toHaveBeenCalledWith(mockReq);
//     expect(mockCheckUserPassword).toHaveBeenCalledWith(mockReq, mockDbUser.password);
//     expect(mockSetTokenService).toHaveBeenCalledWith(mockDbUser.id, mockDbUser.email);
//     expect(mockAddSocket).toHaveBeenCalledWith(mockSocket);
//     expect(mockSocket.userId).toBe(mockDbUser.id.toString());
//     expect(mockLoginResponseHandler).toHaveBeenCalledWith(
//       mockSocket,
//       expect.objectContaining({
//         payload: {
//           oneofKind: 'loginResponse',
//           loginResponse: {
//             success: true,
//             message: '로그인 성공',
//             token: 'new-token',
//             myInfo: { id: mockDbUser.id.toString(), nickname: mockDbUser.nickname },
//             failCode: GlobalFailCode.NONE_FAILCODE,
//           },
//         },
//       }),
//     );
//   });

//   it('유저가 DB에 없으면 로그인 실패', async () => {
//     mockGetUserData.mockResolvedValue(null);

//     await loginRequestHandler(mockSocket as GameSocket, mockPacket);

//     expect(mockLoginResponseHandler).toHaveBeenCalledWith(
//       mockSocket,
//       expect.objectContaining({
//         payload: {
//           oneofKind: 'loginResponse',
//           loginResponse: {
//             success: false,
//             message: '해당 유저는 존재하지 않습니다.',
//             failCode: GlobalFailCode.INVALID_REQUEST,
//             token: '',
//             myInfo: undefined,
//           },
//         },
//       }),
//     );
//     expect(mockCheckUserPassword).not.toHaveBeenCalled();
//   });

//   it('비밀번호 일치 안 하면 실패', async () => {
//     mockGetUserData.mockResolvedValue(mockDbUser);
//     mockCheckUserPassword.mockResolvedValue(false);

//     await loginRequestHandler(mockSocket as GameSocket, mockPacket);

//     expect(mockLoginResponseHandler).toHaveBeenCalledWith(
//       mockSocket,
//       expect.objectContaining({
//         payload: {
//           oneofKind: 'loginResponse',
//           loginResponse: {
//             success: false,
//             message: '비밀번호가 일치하지 않습니다.',
//             failCode: GlobalFailCode.INVALID_REQUEST,
//             token: '',
//             myInfo: undefined,
//           },
//         },
//       }),
//     );
//     expect(mockSetTokenService).not.toHaveBeenCalled();
//   });

//   it('DB에 토큰이 있으면 로그인 상태', async () => {
//     mockDbUser.token = 'existing-token';
//     mockGetUserData.mockResolvedValue(mockDbUser);

//     await loginRequestHandler(mockSocket as GameSocket, mockPacket);

//     expect(mockLoginResponseHandler).toHaveBeenCalledWith(
//       mockSocket,
//       expect.objectContaining({
//         payload: {
//           oneofKind: 'loginResponse',
//           loginResponse: {
//             success: false,
//             message: '로그인 상태 입니다.',
//             failCode: GlobalFailCode.INVALID_REQUEST,
//             token: '',
//             myInfo: undefined,
//           },
//         },
//       }),
//     );
//     expect(mockSetTokenService).not.toHaveBeenCalled();
//   });
// });
