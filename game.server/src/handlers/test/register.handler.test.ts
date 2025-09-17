
import registerRequestHandler from '../request/register.request.handler';
import { GameSocket } from '../../type/game.socket';
import { GamePacket } from '../../generated/gamePacket';
import { getGamePacketType } from '../../utils/type.converter';
import registerResponseHandler from '../response/register.response.handler';
import inputFieldCheckService from '../../services/register/input.field.check.service';
import { validateInput } from '../../utils/validation';
import checkUserDbService from '../../services/register/check.user.db.service';
import { createUserDB } from '../../services/prisma.service';
import { handleError } from '../handleError';
import { GamePacketType } from '../../enums/gamePacketType';
import { C2SRegisterRequest } from '../../generated/packet/auth';
import { GlobalFailCode } from '../../generated/common/enums';

jest.mock('../../utils/type.converter');
jest.mock('../response/register.response.handler');
jest.mock('../../services/register/input.field.check.service');
jest.mock('../../utils/validation');
jest.mock('../../services/register/check.user.db.service');
jest.mock('../../services/prisma.service');
jest.mock('../handleError');

describe('registerRequestHandler', () => {
  let mockSocket: Partial<GameSocket>;
  let mockGamePacket: GamePacket;
  let mockRegisterRequest: C2SRegisterRequest;

  beforeEach(() => {
    mockSocket = {
    };
    mockRegisterRequest = {
      email: 'test@example.com',
      nickname: 'testuser',
      password: 'Password123!',
    };
    mockGamePacket = {
      payload: {
        oneofKind: 'registerRequest',
        registerRequest: mockRegisterRequest,
      },
    };

    (getGamePacketType as jest.Mock).mockReturnValue({ registerRequest: mockRegisterRequest });
    (inputFieldCheckService as jest.Mock).mockReturnValue(true);
    (validateInput.email as jest.Mock).mockReturnValue(true);
    (validateInput.nickName as jest.Mock).mockReturnValue(true);
    (validateInput.password as jest.Mock).mockReturnValue(true);
    (checkUserDbService as jest.Mock).mockResolvedValue(true);
    (createUserDB as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful registration', async () => {
    await registerRequestHandler(mockSocket as GameSocket, mockGamePacket);

    expect(checkUserDbService).toHaveBeenCalledWith(mockRegisterRequest);
    expect(createUserDB).toHaveBeenCalledWith(mockRegisterRequest);
    expect(registerResponseHandler).toHaveBeenCalledWith(
      mockSocket,
      expect.objectContaining({
        payload: expect.objectContaining({
          registerResponse: expect.objectContaining({ success: true }),
        }),
      }),
    );
  });

  it('should not proceed if payload is missing', async () => {
    (getGamePacketType as jest.Mock).mockReturnValue(null);
    await registerRequestHandler(mockSocket as GameSocket, mockGamePacket);
    expect(registerResponseHandler).not.toHaveBeenCalled();
  });

  it('should handle missing input fields', async () => {
    (inputFieldCheckService as jest.Mock).mockReturnValue(false);
    await registerRequestHandler(mockSocket as GameSocket, mockGamePacket);
    expect(registerResponseHandler).toHaveBeenCalledWith(
      mockSocket,
      expect.objectContaining({
        payload: expect.objectContaining({
          registerResponse: expect.objectContaining({ 
            success: false,
            message: '모든 필드가 입력되지 않았습니다.'
          }),
        }),
      }),
    );
  });

  it('should handle invalid email', async () => {
    (validateInput.email as jest.Mock).mockReturnValue(false);
    await registerRequestHandler(mockSocket as GameSocket, mockGamePacket);
    expect(registerResponseHandler).toHaveBeenCalledWith(
      mockSocket,
      expect.objectContaining({
        payload: expect.objectContaining({
          registerResponse: expect.objectContaining({ 
            success: false,
            message: '올바른 이메일 형식이 아닙니다'
          }),
        }),
      }),
    );
  });

  it('should handle existing user', async () => {
    (checkUserDbService as jest.Mock).mockResolvedValue(false);
    await registerRequestHandler(mockSocket as GameSocket, mockGamePacket);
    expect(registerResponseHandler).toHaveBeenCalledWith(
      mockSocket,
      expect.objectContaining({
        payload: expect.objectContaining({
          registerResponse: expect.objectContaining({ 
            success: false,
            message: '이미 가입된 이메일 또는 닉네임입니다.'
          }),
        }),
      }),
    );
  });

  it('should handle errors during registration', async () => {
    const error = new Error('DB error');
    (createUserDB as jest.Mock).mockRejectedValue(error);
    await registerRequestHandler(mockSocket as GameSocket, mockGamePacket);
    expect(handleError).toHaveBeenCalledWith(mockSocket, error);
  });
});
