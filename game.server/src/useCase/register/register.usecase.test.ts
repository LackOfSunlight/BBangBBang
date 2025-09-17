
import { registerUseCase } from './register.usecase';
import { C2SRegisterRequest } from '../../generated/packet/auth';
import { GamePacketType } from '../../enums/gamePacketType';
import { GlobalFailCode } from '../../generated/common/enums';
import inputFieldCheckService from '../../services/register/input.field.check.service';
import { validateInput } from '../../utils/validation';
import checkUserDbService from '../../services/register/check.user.db.service';
import { createUserDB } from '../../services/prisma.service';

jest.mock('../../services/register/input.field.check.service');
jest.mock('../../utils/validation');
jest.mock('../../services/register/check.user.db.service');
jest.mock('../../services/prisma.service');

describe('registerUseCase', () => {
  const mockRequest: C2SRegisterRequest = {
    email: 'test@example.com',
    nickname: 'testuser',
    password: 'Password123!',
  };

  beforeEach(() => {
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

  it('모든 입력값이 입력 되어야함', async () => {
    const response = await registerUseCase(mockRequest);

    expect(response.payload.oneofKind).toBe(GamePacketType.registerResponse);
    if (response.payload.oneofKind === GamePacketType.registerResponse) {
      expect(response.payload.registerResponse.success).toBe(true);
      expect(response.payload.registerResponse.message).toBe('회원가입 성공');
      expect(response.payload.registerResponse.failCode).toBe(GlobalFailCode.NONE_FAILCODE);
    }
    expect(createUserDB).toHaveBeenCalledWith(mockRequest);
  });

  it('모든 필드가 입력되지 않으면 출력', async () => {
    (inputFieldCheckService as jest.Mock).mockReturnValue(false);
    const response = await registerUseCase(mockRequest);

    expect(response.payload.oneofKind).toBe(GamePacketType.registerResponse);
    if (response.payload.oneofKind === GamePacketType.registerResponse) {
      expect(response.payload.registerResponse.success).toBe(false);
      expect(response.payload.registerResponse.message).toBe('모든 필드가 입력되지 않았습니다.');
      expect(response.payload.registerResponse.failCode).toBe(GlobalFailCode.REGISTER_FAILED);
    }
  });

  it('이메일 형식이 올바르지 않은면 출력', async () => {
    (validateInput.email as jest.Mock).mockReturnValue(false);
    const response = await registerUseCase(mockRequest);

    if (response.payload.oneofKind === GamePacketType.registerResponse) {
      expect(response.payload.registerResponse.success).toBe(false);
      expect(response.payload.registerResponse.message).toBe('올바른 이메일 형식이 아닙니다');
      expect(response.payload.registerResponse.failCode).toBe(GlobalFailCode.REGISTER_FAILED);
    }
  });

  it('닉네임 오류', async () => {
    (validateInput.nickName as jest.Mock).mockReturnValue(false);
    const response = await registerUseCase(mockRequest);

    if (response.payload.oneofKind === GamePacketType.registerResponse) {
      expect(response.payload.registerResponse.success).toBe(false);
      expect(response.payload.registerResponse.message).toBe('4-20자의 한글, 영문, 숫자, 언더스코어만 사용 가능합니다.');
      expect(response.payload.registerResponse.failCode).toBe(GlobalFailCode.REGISTER_FAILED);
    }
  });

  it('비밀번호 오류', async () => {
    (validateInput.password as jest.Mock).mockReturnValue(false);
    const response = await registerUseCase(mockRequest);

    if (response.payload.oneofKind === GamePacketType.registerResponse) {
      expect(response.payload.registerResponse.success).toBe(false);
      expect(response.payload.registerResponse.message).toBe('비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.');
      expect(response.payload.registerResponse.failCode).toBe(GlobalFailCode.REGISTER_FAILED);
    }
  });

  it('이미 가입된 이메일인지 확인', async () => {
    (checkUserDbService as jest.Mock).mockResolvedValue(false);
    const response = await registerUseCase(mockRequest);

    if (response.payload.oneofKind === GamePacketType.registerResponse) {
      expect(response.payload.registerResponse.success).toBe(false);
      expect(response.payload.registerResponse.message).toBe('이미 가입된 이메일 또는 닉네임입니다.');
      expect(response.payload.registerResponse.failCode).toBe(GlobalFailCode.REGISTER_FAILED);
    }
  });
});
