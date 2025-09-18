import { GameSocket } from '../../type/game.socket';
import { GamePacket } from '../../generated/gamePacket';
import { C2SGamePrepareRequest } from '../../generated/packet/game_actions';
import { GlobalFailCode } from '../../generated/common/enums';
import { GamePacketType } from '../../enums/gamePacketType';
import { gamePrepareUseCase } from '../../useCase/game.prepare/game.prepare.usecase';
import { sendData } from '../../utils/send.data';
import { getGamePacketType } from '../../utils/type.converter';
import gamePrepareHandler from '../game.prepare.handler';

// 의존성 Mock 처리
jest.mock('../../useCase/game.prepare/game.prepare.usecase');
jest.mock('../../utils/send.data');
jest.mock('../../utils/type.converter');

// Mock 함수 캐스팅
const mockGamePrepareUseCase = gamePrepareUseCase as jest.Mock;
const mockSendData = sendData as jest.Mock;
const mockGetGamePacketType = getGamePacketType as jest.Mock;

describe('gamePrepareHandler', () => {
	let mockSocket: GameSocket;
	const mockRequest: C2SGamePrepareRequest = {};
	const mockGamePacket: GamePacket = {
		payload: {
			oneofKind: 'gamePrepareRequest',
			gamePrepareRequest: mockRequest,
		},
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockSocket = { userId: 'user-1', roomId: 1 } as GameSocket;
		// getGamePacketType의 기본 동작 설정
		mockGetGamePacketType.mockReturnValue({ gamePrepareRequest: mockRequest });
	});

	it('유스케이스를 호출하고 반환된 성공 패킷을 전송해야 한다', async () => {
		// Arrange: 유스케이스가 성공 패킷을 반환하도록 설정
		const successPacket: GamePacket = {
			payload: {
				oneofKind: 'gamePrepareResponse',
				gamePrepareResponse: { success: true, failCode: GlobalFailCode.NONE_FAILCODE },
			},
		};
		mockGamePrepareUseCase.mockResolvedValue(successPacket);

		// Act: 핸들러 실행
		await gamePrepareHandler(mockSocket, mockGamePacket);

		// Assert: 유스케이스와 sendData가 올바른 인자와 함께 호출되었는지 검증
		expect(mockGamePrepareUseCase).toHaveBeenCalledWith(mockSocket, mockRequest);
		expect(mockSendData).toHaveBeenCalledWith(
			mockSocket,
			successPacket,
			GamePacketType.gamePrepareResponse,
		);
	});

	it('유스케이스가 실패 패킷을 반환하면 해당 패킷을 그대로 전송해야 한다', async () => {
		// Arrange: 유스케이스가 실패 패킷을 반환하도록 설정
		const failurePacket: GamePacket = {
			payload: {
				oneofKind: 'gamePrepareResponse',
				gamePrepareResponse: { success: false, failCode: GlobalFailCode.ROOM_NOT_FOUND },
			},
		};
		mockGamePrepareUseCase.mockResolvedValue(failurePacket);

		// Act: 핸들러 실행
		await gamePrepareHandler(mockSocket, mockGamePacket);

		// Assert: 유스케이스와 sendData가 올바른 인자와 함께 호출되었는지 검증
		expect(mockGamePrepareUseCase).toHaveBeenCalledWith(mockSocket, mockRequest);
		expect(mockSendData).toHaveBeenCalledWith(
			mockSocket,
			failurePacket,
			GamePacketType.gamePrepareResponse,
		);
	});

	it('요청 패킷의 페이로드가 유효하지 않으면 아무 작업도 하지 않아야 한다', async () => {
		// Arrange: getGamePacketType이 undefined를 반환하는 상황을 시뮬레이션
		mockGetGamePacketType.mockReturnValue(undefined);

		// Act: 핸들러 실행
		await gamePrepareHandler(mockSocket, mockGamePacket);

		// Assert: 아무 함수도 호출되지 않았는지 검증
		expect(mockGamePrepareUseCase).not.toHaveBeenCalled();
		expect(mockSendData).not.toHaveBeenCalled();
	});
});
