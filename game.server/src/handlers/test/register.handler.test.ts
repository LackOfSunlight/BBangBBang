import registerHandler from '../register.handler';
import { getGamePacketType } from '../../converter/type.form';
import { registerUseCase } from '../../useCase/register/register.usecase';
import { sendData } from '../../sockets/send.data';
import { GamePacketType } from '../../enums/gamePacketType';
import { GameSocket } from '../../type/game.socket';
import { GamePacket } from '../../generated/gamePacket';
import { C2SRegisterRequest } from '../../generated/packet/auth';
import { GlobalFailCode } from '../../generated/common/enums';

jest.mock('../../utils/type.converter.js');
jest.mock('../../useCase/register/register.usecase.js');
jest.mock('../../utils/send.data.js');

describe('registerHandler', () => {
	let mockSocket: Partial<GameSocket>;
	let mockGamePacket: GamePacket;
	let mockPayload: C2SRegisterRequest;
	let mockReturnGamePacket: GamePacket;

	beforeEach(() => {
		mockSocket = {
			userId: '1',
		};
		mockGamePacket = {
			payload: {
				oneofKind: GamePacketType.registerRequest,
				registerRequest: {
					email: 'test@naver.com',
					nickname: 'testUser',
					password: 'qwer1234!!',
				},
			},
		};

		mockPayload = {
			email: 'test@naver.com',
			nickname: 'testUser',
			password: 'qwer1234!!',
		};

		mockReturnGamePacket = {
			payload: {
				oneofKind: GamePacketType.registerResponse,
				registerResponse: {
					success: true,
					message: '회원가입에 성공하였습니다.',
					failCode: GlobalFailCode.NONE_FAILCODE,
				},
			},
		};

		(getGamePacketType as jest.Mock).mockReturnValue(mockGamePacket.payload);
		(registerUseCase as jest.Mock).mockResolvedValue(mockReturnGamePacket);
		(sendData as jest.Mock).mockImplementation(() => {});
	});

  
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('유효한 회원가입 요청을 처리하고 응답을 전송해야 합니다', async () => {
		await registerHandler(mockSocket as GameSocket, mockGamePacket);

		expect(getGamePacketType).toHaveBeenCalledWith(mockGamePacket, GamePacketType.registerRequest);
		expect(registerUseCase).toHaveBeenCalledWith(mockSocket, mockPayload);
		expect(sendData).toHaveBeenCalledWith(
			mockSocket,
			mockReturnGamePacket,
			GamePacketType.registerResponse,
		);
	});

	it('페이로드가 유효하지 않으면 요청을 처리하지 않아야 합니다', async () => {
		(getGamePacketType as jest.Mock).mockReturnValue(null);

		await registerHandler(mockSocket as GameSocket, mockGamePacket);

		expect(getGamePacketType).toHaveBeenCalledWith(mockGamePacket, GamePacketType.registerRequest);
		expect(registerUseCase).not.toHaveBeenCalled();
		expect(sendData).not.toHaveBeenCalled();
	});
});
