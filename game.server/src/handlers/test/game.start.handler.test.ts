import gameStartHandler from '../game.start.handler';
import { GameSocket } from '../../type/game.socket';
import { GamePacket } from '../../generated/gamePacket';
import { C2SGameStartRequest } from '../../generated/packet/game_actions';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType';
import { GlobalFailCode } from '../../generated/common/enums';

// 의존성 모킹
jest.mock('../../useCase/game.start/game.start.usecase', () => ({
	gameStartUseCase: jest.fn(),
}));
jest.mock('../../utils/send.data', () => ({
	sendData: jest.fn(),
}));
jest.mock('../../utils/type.converter', () => ({
	getGamePacketType: jest.fn(),
}));

// 모킹된 함수 임포트
import { gameStartUseCase } from '../../useCase/game.start/game.start.usecase';
import { sendData } from '../../utils/send.data';
import { getGamePacketType } from '../../utils/type.converter';

// 모의 함수 타입 캐스팅
const mockGameStartUseCase = gameStartUseCase as jest.Mock;
const mockSendData = sendData as jest.Mock;
const mockGetGamePacketType = getGamePacketType as jest.Mock;

describe('gameStartHandler', () => {
	let mockSocket: GameSocket;

	beforeEach(() => {
		// 각 테스트 전에 모든 모의 함수를 초기화합니다.
		jest.clearAllMocks();
		// 테스트용 모의 소켓을 설정합니다.
		mockSocket = {
			userId: 'test-user-id',
			roomId: 1,
		} as GameSocket;
	});

	test('유효한 게임 시작 요청 패킷을 받으면, use case를 호출하고 응답을 전송해야 한다', async () => {
		// Arrange: 테스트 데이터 및 모의 함수 설정
		const request: C2SGameStartRequest = {};
		const gamePacket: GamePacket = {
			payload: {
				oneofKind: 'gameStartRequest',
				gameStartRequest: request,
			},
		};
		const useCaseResponse: GamePacket = {
			payload: {
				oneofKind: 'gameStartResponse',
				gameStartResponse: { success: true, failCode: GlobalFailCode.NONE_FAILCODE },
			},
		};

		mockGetGamePacketType.mockReturnValue(gamePacket.payload);
		mockGameStartUseCase.mockResolvedValue(useCaseResponse);

		// Act: 핸들러 실행
		await gameStartHandler(mockSocket, gamePacket);

		// Assert: 함수 호출 및 인자 검증
		expect(mockGetGamePacketType).toHaveBeenCalledWith(gamePacket, gamePackTypeSelect.gameStartRequest);
		expect(mockGameStartUseCase).toHaveBeenCalledWith(mockSocket, request);
		expect(mockSendData).toHaveBeenCalledWith(
			mockSocket,
			useCaseResponse,
			GamePacketType.gameStartResponse,
		);
	});

	test('유효하지 않은 패킷을 받으면, 아무 동작도 하지 않아야 한다', async () => {
		// Arrange: 유효하지 않은 패킷 설정
		const gamePacket: GamePacket = {
			payload: { oneofKind: undefined }, // 잘못된 패킷 종류
		};

		mockGetGamePacketType.mockReturnValue(null);

		// Act: 핸들러 실행
		await gameStartHandler(mockSocket, gamePacket);

		// Assert: 특정 함수들이 호출되지 않았는지 검증
		expect(mockGetGamePacketType).toHaveBeenCalledWith(gamePacket, gamePackTypeSelect.gameStartRequest);
		expect(mockGameStartUseCase).not.toHaveBeenCalled();
		expect(mockSendData).not.toHaveBeenCalled();
	});
});
