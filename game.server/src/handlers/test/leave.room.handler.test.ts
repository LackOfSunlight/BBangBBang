import { GamePacketType, gamePackTypeSelect } from '../../Enums/gamePacketType';
import { GlobalFailCode } from '../../Generated/common/enums';
import { GamePacket } from '../../Generated/gamePacket';
import { C2SLeaveRoomRequest } from '../../Generated/packet/room_actions';
import { GameSocket } from '../../Type/game.socket';
import { leaveRoomUseCase } from '../../UseCase/Leave.room/leave.room.usecase';
import { sendData } from '../../Sockets/send.data';
import { getGamePacketType } from '../../Converter/type.form';
import leaveRoomHandler from '../leave.room.handler';

// 의존성 Mock 처리
jest.mock('../../useCase/leave.room/leave.room.usecase');
jest.mock('../../utils/send.data');
jest.mock('../../utils/type.converter');

// Mock 함수
const mockLeaveRoomUseCase = leaveRoomUseCase as jest.Mock;
const mockSendData = sendData as jest.Mock;
const mockGetGamePacketType = getGamePacketType as jest.Mock;

describe('leaveRoomHandler', () => {
	let mockSocket: Partial<GameSocket>;
	const mockLeaveRoomRequest: C2SLeaveRoomRequest = {}; // 요청 페이로드는 비어있음
	const mockGamePacket: GamePacket = {
		payload: {
			oneofKind: 'leaveRoomRequest',
			leaveRoomRequest: mockLeaveRoomRequest,
		},
	};

	beforeEach(() => {
		// 각 테스트 전에 모든 Mock을 초기화
		jest.clearAllMocks();

		// 기본 Mock 소켓 설정
		mockSocket = {
			userId: 'user-1',
			roomId: 1,
		};

		// getGamePacketType이 항상 페이로드를 반환하도록 설정
		mockGetGamePacketType.mockReturnValue({ leaveRoomRequest: mockLeaveRoomRequest });
	});

	it('유스케이스를 호출하고 그 결과 패킷을 전송해야 한다', async () => {
		// Arrange: 유스케이스가 성공 응답 패킷을 반환하도록 설정
		const mockResponsePacket: GamePacket = {
			payload: {
				oneofKind: 'leaveRoomResponse',
				leaveRoomResponse: { success: true, failCode: GlobalFailCode.NONE_FAILCODE },
			},
		};
		mockLeaveRoomUseCase.mockResolvedValue(mockResponsePacket);

		// Act: 핸들러 실행
		await leaveRoomHandler(mockSocket as GameSocket, mockGamePacket);

		// Assert
		// 1. 유스케이스가 올바른 인자와 함께 호출되었는지 검증
		expect(mockLeaveRoomUseCase).toHaveBeenCalledWith(mockSocket, mockLeaveRoomRequest);
		expect(mockLeaveRoomUseCase).toHaveBeenCalledTimes(1);

		// 2. sendData가 유스케이스의 반환값으로 호출되었는지 검증
		expect(mockSendData).toHaveBeenCalledWith(
			mockSocket,
			mockResponsePacket, // 유스케이스가 반환한 패킷과 동일한지 확인
			GamePacketType.leaveRoomResponse,
		);
		expect(mockSendData).toHaveBeenCalledTimes(1);
	});

	it('유스케이스로부터 받은 실패 응답도 올바르게 전송해야 한다', async () => {
		// Arrange: 유스케이스가 실패 응답 패킷을 반환하도록 설정
		const mockFailurePacket: GamePacket = {
			payload: {
				oneofKind: 'leaveRoomResponse',
				leaveRoomResponse: { success: false, failCode: GlobalFailCode.ROOM_NOT_FOUND },
			},
		};
		mockLeaveRoomUseCase.mockResolvedValue(mockFailurePacket);

		// Act: 핸들러 실행
		await leaveRoomHandler(mockSocket as GameSocket, mockGamePacket);

		// Assert
		// 1. 유스케이스가 호출되었는지 확인
		expect(mockLeaveRoomUseCase).toHaveBeenCalledWith(mockSocket, mockLeaveRoomRequest);

		// 2. sendData가 실패 패킷으로 호출되었는지 확인
		expect(mockSendData).toHaveBeenCalledWith(
			mockSocket,
			mockFailurePacket,
			GamePacketType.leaveRoomResponse,
		);
	});

	it('요청 패킷이 leaveRoomRequest가 아니면 아무 작업도 하지 않아야 한다', async () => {
		// Arrange: getGamePacketType이 undefined를 반환하도록 설정 (잘못된 패킷 타입)
		mockGetGamePacketType.mockReturnValue(undefined);

		// Act: 핸들러 실행
		await leaveRoomHandler(mockSocket as GameSocket, mockGamePacket);

		// Assert: 유스케이스와 sendData 모두 호출되지 않았는지 검증
		expect(mockLeaveRoomUseCase).not.toHaveBeenCalled();
		expect(mockSendData).not.toHaveBeenCalled();
	});
});
