import loginHandler from '../login.handler';
import { GameSocket } from '../../type/game.socket';
import { GamePacket } from '../../generated/gamePacket';
import { getGamePacketType } from '../../converter/type.form';
import { sendData } from '../../sockets/send.data';
import loginUseCase from '../../useCase/login/login.usecase';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType';
import { C2SLoginRequest, S2CLoginResponse } from '../../generated/packet/auth';
import { GlobalFailCode } from '../../generated/common/enums';

jest.mock('../../utils/type.converter.js');
jest.mock('../../useCase/login/login.usecase.js');
jest.mock('../../utils/send.data.js');

describe('loginHandler', () => {
  let mockSocket: Partial<GameSocket>;
  let mockGamePacket: GamePacket;
  let mockLoginRequest: C2SLoginRequest;
  let mockLoginResponse: S2CLoginResponse;

  beforeEach(() => {
    mockSocket = {
    };

    mockLoginRequest = {
        email: 'test@naver.com',
        password: 'qwer1234!'
    };

    mockGamePacket = {
      payload: {
        oneofKind: GamePacketType.loginRequest,
        loginRequest: mockLoginRequest,
      },
    };

    mockLoginResponse = {
            success: true,
            message: '로그인 성공하였습니다',
            token: 'abc123',
            failCode: GlobalFailCode.NONE_FAILCODE,
    };

    (getGamePacketType as jest.Mock).mockReturnValue(mockGamePacket.payload);
    (loginUseCase as jest.Mock).mockResolvedValue(mockLoginResponse);
    (sendData as jest.Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('요청을 성공적으로 처리하고 응답을 전송해야 함', async () => {
    await loginHandler(mockSocket as GameSocket, mockGamePacket);

    expect(getGamePacketType).toHaveBeenCalledWith(mockGamePacket, gamePackTypeSelect.loginRequest);
    expect(loginUseCase).toHaveBeenCalledWith(mockSocket, mockLoginRequest);
    expect(sendData).toHaveBeenCalledWith(mockSocket, mockLoginResponse, GamePacketType.loginResponse);
  });

  it('payload가 없으면 아무 작업도 수행하지 않아야 함', async () => {
    (getGamePacketType as jest.Mock).mockReturnValue(null);

    await loginHandler(mockSocket as GameSocket, mockGamePacket);

    expect(loginUseCase).not.toHaveBeenCalled();
    expect(sendData).not.toHaveBeenCalled();
  });
});
