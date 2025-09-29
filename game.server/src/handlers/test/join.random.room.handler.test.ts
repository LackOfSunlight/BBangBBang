import joinRandomRoomHandler from '../join.random.room.handler';
import { GameSocket } from '../../Type/game.socket.js';
import { GamePacket } from '../../Generated/gamePacket.js';
import { getGamePacketType } from '../../Converter/type.form.js';
import { sendData } from '../../Sockets/send.data.js';
import joinRandomRoomUseCase from '../../UseCase/Join.random.room/join.random.room.usecase.js';
import { GamePacketType } from '../../Enums/gamePacketType.js';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';
import { C2SJoinRandomRoomRequest, C2SJoinRoomRequest } from '../../Generated/packet/room_actions';
import { GlobalFailCode, RoomStateType } from '../../Generated/common/enums';

jest.mock('../../utils/type.converter.js');
jest.mock('../../useCase/join.random.room/join.random.room.usecase.js');
jest.mock('../../utils/send.data.js');

describe('joinRandomRoomHandler', () => {
	let mockSocket: Partial<GameSocket>;
	let mockGamePacket: GamePacket;
	let mockUser: User;
	let mockRoom: Room;
	let mockReturnGamePacket: GamePacket;
	let mockPayload: C2SJoinRandomRoomRequest;

	beforeEach(() => {
		mockSocket = {
			userId: '1',
		};

		mockGamePacket = {
			payload: {
				oneofKind: GamePacketType.joinRandomRoomRequest,
				joinRandomRoomRequest: {},
			},
		};

		mockPayload = {};

		mockUser = {
			id: '1',
			nickname: 'testUser',
		};

		mockRoom = {
			id: 1,
			ownerId: '2',
			name: 'testRoom',
			maxUserNum: 4,
			state: RoomStateType.WAIT,
			users: [new User('1', 'hostUser'), mockUser],
		};

		mockReturnGamePacket = {
			payload: {
				oneofKind: GamePacketType.joinRandomRoomResponse,
				joinRandomRoomResponse: {
					success: true,
					room: mockRoom,
					failCode: GlobalFailCode.NONE_FAILCODE,
				},
			},
		};

		(getGamePacketType as jest.Mock).mockReturnValue(mockGamePacket.payload);
		(joinRandomRoomUseCase as jest.Mock).mockResolvedValue(mockReturnGamePacket);
		(sendData as jest.Mock).mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('요청을 성공적으로 처리하고 응답을 전송해야 함', async () => {
		await joinRandomRoomHandler(mockSocket as GameSocket, mockGamePacket);

		expect(getGamePacketType).toHaveBeenCalledWith(
			mockGamePacket,
			GamePacketType.joinRandomRoomRequest,
		);
		expect(joinRandomRoomUseCase).toHaveBeenCalledWith(mockSocket, mockPayload);

		const useCaseResult = await (joinRandomRoomUseCase as jest.Mock).mock.results[0].value;

		expect(sendData).toHaveBeenCalledWith(
			mockSocket,
			useCaseResult,
			GamePacketType.joinRandomRoomResponse,
		);
	});

	it('payload가 없으면 아무 작업도 수행하지 않아야 함', async () => {
		(getGamePacketType as jest.Mock).mockReturnValue(null);

		await joinRandomRoomHandler(mockSocket as GameSocket, mockGamePacket);

		expect(joinRandomRoomUseCase).not.toHaveBeenCalled();
		expect(sendData).not.toHaveBeenCalled();
	});

	it('socket.userId가 없으면 아무 작업도 수행하지 않아야 함', async () => {
		mockSocket.userId = undefined;

		await joinRandomRoomHandler(mockSocket as GameSocket, mockGamePacket);

		expect(joinRandomRoomUseCase).not.toHaveBeenCalled();
		expect(sendData).not.toHaveBeenCalled();
	});
});
