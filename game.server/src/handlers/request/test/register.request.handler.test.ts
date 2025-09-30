import registerRequestHandler from '../register.request.handler';
import { GameSocket } from '../../../type/game.socket';
import { GamePacket } from '../../../generated/gamePacket';
import { C2SRegisterRequest } from '../../../generated/packet/auth';
import { GlobalFailCode } from '../../../generated/common/enums';
import registerResponseHandler from '../../response/register.response.handler';
import inputFieldCheckService from '../../../services/register.request.handler/input.field.check.service';
import checkUserDbService from '../../../services/register.request.handler/check.user.db.service';
import { validateInput } from '../../../utils/validation';
import { handleError } from '../../handleError';
import { getGamePacketType } from '../../../utils/type.converter';
import { createUserDB } from '../../../services/prisma.service';

// Mock dependencies
jest.mock('../../../utils/type.converter');
jest.mock('../../response/register.response.handler');
jest.mock('../../../services/register.request.handler/input.field.check.service');
jest.mock('../../../services/register.request.handler/check.user.db.service');
jest.mock('../../../services/prisma.service');
jest.mock('../../../utils/validation');
jest.mock('../../handleError');

const mockGetGamePacketType = getGamePacketType as jest.Mock;
const mockRegisterResponseHandler = registerResponseHandler as jest.Mock;
const mockInputFieldCheckService = inputFieldCheckService as jest.Mock;
const mockCheckUserDbService = checkUserDbService as jest.Mock;
const mockCreateUserDB = createUserDB as jest.Mock;
const mockValidateInput = validateInput as jest.Mocked<typeof validateInput>;

describe('registerRequestHandler', () => {
  let mockSocket: Partial<GameSocket>;
  let mockPacket: GamePacket;
  let mockReq: C2SRegisterRequest;

  beforeEach(() => {
    jest.resetAllMocks();

    mockSocket = { userId: '1' };
    mockReq = {
      email: 'test@example.com',
      nickname: 'testuser',
      password: 'Password123!',
    };
    mockPacket = {
      payload: {
        oneofKind: 'registerRequest',
        registerRequest: mockReq,
      },
    };

    mockGetGamePacketType.mockReturnValue(mockPacket.payload);

    // Default to valid
    mockInputFieldCheckService.mockReturnValue(true);
    mockValidateInput.email.mockReturnValue(true);
    mockValidateInput.nickName.mockReturnValue(true);
    mockValidateInput.password.mockReturnValue(true);
    mockCheckUserDbService.mockResolvedValue(true);
  });

  it('모든 검사를 통과하면 성공적으로 등록', async () => {
    await registerRequestHandler(mockSocket as GameSocket, mockPacket);

    expect(mockInputFieldCheckService).toHaveBeenCalledWith(mockReq);
    expect(mockValidateInput.email).toHaveBeenCalledWith(mockReq.email);
    expect(mockValidateInput.nickName).toHaveBeenCalledWith(mockReq.nickname);
    expect(mockValidateInput.password).toHaveBeenCalledWith(mockReq.password);
    expect(mockCheckUserDbService).toHaveBeenCalledWith(mockReq);
    expect(mockCreateUserDB).toHaveBeenCalledWith(mockReq);
    expect(mockRegisterResponseHandler).toHaveBeenCalledWith(
      mockSocket,
      expect.objectContaining({
        payload: {
          oneofKind: 'registerResponse',
          registerResponse: {
            success: true,
            message: '회원가입 성공',
            failCode: GlobalFailCode.NONE_FAILCODE,
          },
        },
      }),
    );
  });

  it('회원가입 정보가 비어있으면 실패 해야함', async () => {
    mockInputFieldCheckService.mockReturnValue(false);

    await registerRequestHandler(mockSocket as GameSocket, mockPacket);

    expect(mockRegisterResponseHandler).toHaveBeenCalledWith(
      mockSocket,
      expect.objectContaining({
        payload: {
          oneofKind: 'registerResponse',
          registerResponse: {
            success: false,
            message: '모든 필드가 입력되지 않았습니다.',
            failCode: GlobalFailCode.REGISTER_FAILED,
          },
        },
      }),
    );
    expect(mockCheckUserDbService).not.toHaveBeenCalled();
  });

  it('이미 가입된 회원이면 실패 해야함', async () => {
    mockCheckUserDbService.mockResolvedValue(false);

    await registerRequestHandler(mockSocket as GameSocket, mockPacket);

    expect(mockRegisterResponseHandler).toHaveBeenCalledWith(
      mockSocket,
      expect.objectContaining({
        payload: {
          oneofKind: 'registerResponse',
          registerResponse: {
            success: false,
            message: '이미 가입된 이메일 또는 닉네임입니다.',
            failCode: GlobalFailCode.REGISTER_FAILED,
          },
        },
      }),
    );
    expect(mockCreateUserDB).not.toHaveBeenCalled();
  });

  it('이메일 형식이 다르면 실패', async () => {
    mockValidateInput.email.mockReturnValue(false);

    await registerRequestHandler(mockSocket as GameSocket, mockPacket);

    expect(mockRegisterResponseHandler).toHaveBeenCalledWith(
      mockSocket,
      expect.objectContaining({
        payload: {
          oneofKind: 'registerResponse',
          registerResponse: {
            success: false,
            message: '올바른 이메일 형식이 아닙니다',
            failCode: GlobalFailCode.REGISTER_FAILED,
          },
        },
      }),
    );
    expect(mockCheckUserDbService).not.toHaveBeenCalled();
  });
});