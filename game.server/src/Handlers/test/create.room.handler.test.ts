import createRoomRequestHandler from '../create.room.handler';
import { GameSocket } from '../../Type/game.socket.js';
import { GamePacket } from '../../Generated/gamePacket.js';
import { getGamePacketType } from '../../Converter/type.form.js';
import { sendData } from '../../Sockets/send.data.js';
import createRoomUseCase from '../../UseCase/create.room/create.room.usecase.js';
import { GamePacketType } from '../../Enums/gamePacketType.js';
import { GlobalFailCode, RoomStateType } from '../../Generated/common/enums';
import { User } from '../../Models/user.model';
import { Room } from '../../Models/room.model';
import { C2SCreateRoomRequest } from '../../Generated/packet/room_actions';

jest.mock('../../utils/type.converter.js');
jest.mock('../../useCase/create.room/create.room.usecase.js');
jest.mock('../../utils/send.data.js');

describe('createRoomRequestHandler', () => {
	let mockSocket: Partial<GameSocket>;
	let mockGamePacket: GamePacket;
	let mockUser: User;
	let mockRoom: Room;
	let mockReturnGamePacket: GamePacket;
	let mockReq: C2SCreateRoomRequest;

	beforeEach(() => {
		mockSocket = {
			userId: '1',
		};
		mockGamePacket = {
			payload: {
				oneofKind: GamePacketType.createRoomRequest,
				createRoomRequest: { name: 'testRoom', maxUserNum: 4 },
			},
		};

		mockReq = {
			name: 'testRoom',
			maxUserNum: 4,
		};

		mockUser = {
			id: '1',
			nickname: 'testUser',
		};

		mockRoom = {
			id: 1,
			ownerId: mockUser.id,
			name: 'testRoom',
			maxUserNum: 4,
			state: RoomStateType.WAIT,
			users: [mockUser],
		};

		mockReturnGamePacket = {
			payload: {
				oneofKind: GamePacketType.createRoomResponse,
				createRoomResponse: {
					success: true,
					room: mockRoom,
					failCode: GlobalFailCode.NONE_FAILCODE,
				},
			},
		};

		(getGamePacketType as jest.Mock).mockReturnValue(mockGamePacket.payload);
		(createRoomUseCase as jest.Mock).mockResolvedValue(mockReturnGamePacket);
		(sendData as jest.Mock).mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('요청을 성공적으로 처리하고 응답을 전송해야 함', async () => {
		await createRoomRequestHandler(mockSocket as GameSocket, mockGamePacket);

		expect(getGamePacketType).toHaveBeenCalledWith(
			mockGamePacket,
			GamePacketType.createRoomRequest,
		);
		expect(createRoomUseCase).toHaveBeenCalledWith(mockSocket, mockReq);

		expect(sendData).toHaveBeenCalledWith(
			mockSocket,
			mockReturnGamePacket,
			GamePacketType.createRoomResponse,
		);
	});

	it('payload가 없으면 아무 작업도 수행하지 않아야 함', async () => {
		(getGamePacketType as jest.Mock).mockReturnValue(null);

		await createRoomRequestHandler(mockSocket as GameSocket, mockGamePacket);

		expect(createRoomUseCase).not.toHaveBeenCalled();
		expect(sendData).not.toHaveBeenCalled();
	});

	it('socket.userId가 없으면 아무 작업도 수행하지 않아야 함', async () => {
		mockSocket.userId = undefined;

		await createRoomRequestHandler(mockSocket as GameSocket, mockGamePacket);

		expect(createRoomUseCase).not.toHaveBeenCalled();
		expect(sendData).not.toHaveBeenCalled();
	});
});
