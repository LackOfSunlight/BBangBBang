import loginUseCase from './login.usecase';
import { C2SLoginRequest } from '../../generated/packet/auth';
import { GameSocket } from '../../type/game.socket';
import { getUserByEmail, setTokenService } from '../../services/prisma.service';
import checkUserPassword from '../../services/login/check.user.password';
import socketManager from '../../managers/socket.manger';
import { gamePackTypeSelect } from '../../enums/gamePacketType';
import { GlobalFailCode } from '../../generated/common/enums';
import { getGamePacketType } from '../../converter/type.form';

jest.mock('../../services/prisma.service');
jest.mock('../../services/login/check.user.password');
jest.mock('../../managers/socket.manger');

describe('loginUseCase', () => {
	const mockSocket: Partial<GameSocket> = {
		userId: '',
	};
	const mockRequest: C2SLoginRequest = {
		email: 'test@example.com',
		password: 'password123',
	};

	const mockUser = {
		id: 1,
		email: 'test@example.com',
		nickname: 'testuser',
		password: 'hashedpassword',
		token: null,
	};

	beforeEach(() => {
		(getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
		(checkUserPassword as jest.Mock).mockResolvedValue(true);
		(setTokenService as jest.Mock).mockResolvedValue('test_token');
		// socketManager의 addSocket 메서드를 모의 처리합니다.
		(socketManager.addSocket as jest.Mock).mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('로그인 성공', async () => {
		const response = await loginUseCase(mockSocket as GameSocket, mockRequest);
		const payload = getGamePacketType(response, gamePackTypeSelect.loginResponse);
		expect(payload).toBeDefined();
		if (!payload) return;
		const { loginResponse } = payload;

		expect(getUserByEmail).toHaveBeenCalledWith(mockRequest.email);
		expect(checkUserPassword).toHaveBeenCalledWith(mockRequest, mockUser.password);
		expect(setTokenService).toHaveBeenCalledWith(mockUser.id, mockUser.email);
		expect(socketManager.addSocket).toHaveBeenCalledWith(mockSocket);
		expect(mockSocket.userId).toBe(mockUser.id.toString());

		expect(loginResponse.success).toBe(true);
		expect(loginResponse.message).toBe('로그인 성공');
		expect(loginResponse.token).toBe('test_token');
		expect(loginResponse.failCode).toBe(GlobalFailCode.NONE_FAILCODE);
		expect(loginResponse.myInfo).toEqual({
			id: mockUser.id.toString(),
			nickname: mockUser.nickname,
		});
	});

	it('유저가 존재하지 않을 때', async () => {
		(getUserByEmail as jest.Mock).mockResolvedValue(null);

		const response = await loginUseCase(mockSocket as GameSocket, mockRequest);
		const payload = getGamePacketType(response, gamePackTypeSelect.loginResponse);
		expect(payload).toBeDefined();
		if (!payload) return;
		const { loginResponse } = payload;

		expect(loginResponse.success).toBe(false);
		expect(loginResponse.message).toBe('해당 유저는 존재하지 않습니다.');
		expect(loginResponse.failCode).toBe(GlobalFailCode.INVALID_REQUEST);
	});

	it('이미 로그인된 유저일 때', async () => {
		(getUserByEmail as jest.Mock).mockResolvedValue({ ...mockUser, token: 'existing_token' });

		const response = await loginUseCase(mockSocket as GameSocket, mockRequest);
		const payload = getGamePacketType(response, gamePackTypeSelect.loginResponse);
		expect(payload).toBeDefined();
		if (!payload) return;
		const { loginResponse } = payload;

		expect(loginResponse.success).toBe(false);
		expect(loginResponse.message).toBe('로그인 상태 입니다.');
		expect(loginResponse.failCode).toBe(GlobalFailCode.INVALID_REQUEST);
	});

	it('비밀번호가 일치하지 않을 때', async () => {
		(checkUserPassword as jest.Mock).mockResolvedValue(false);

		const response = await loginUseCase(mockSocket as GameSocket, mockRequest);
		const payload = getGamePacketType(response, gamePackTypeSelect.loginResponse);
		expect(payload).toBeDefined();
		if (!payload) return;
		const { loginResponse } = payload;

		expect(loginResponse.success).toBe(false);
		expect(loginResponse.message).toBe('비밀번호가 일치하지 않습니다.');
		expect(loginResponse.failCode).toBe(GlobalFailCode.INVALID_REQUEST);
	});
});
