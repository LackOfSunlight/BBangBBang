import joinRoomHandler from '../join.room.handler';
import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { sendData } from '../../utils/send.data.js';
import joinRoomUseCase from '../../useCase/join.room/join.room.usecase.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { GlobalFailCode, RoomStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { C2SJoinRoomRequest } from '../../generated/packet/room_actions';

jest.mock('../../utils/type.converter.js');
jest.mock('../../useCase/join.room/join.room.usecase.js');
jest.mock('../../utils/send.data.js');

describe('joinRoomRequestHandler', () => {
	let mockSocket: Partial<GameSocket>;
	let mockGamePacket: GamePacket;
	let mockUser: User;
	let mockRoom: Room;
	let mockReturnGamePacket: GamePacket;
	let mockPayloadJoinRoom: C2SJoinRoomRequest;

	beforeEach(() => {
		mockSocket = {
			userId: '1',
		};

		mockGamePacket = {
			payload: {
				oneofKind: GamePacketType.joinRoomRequest,
				joinRoomRequest: { roomId: 1 },
			},
		};
		mockPayloadJoinRoom = {
			roomId: 1,
		};

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
				oneofKind: GamePacketType.joinRoomResponse,
				joinRoomResponse: {
					success: true,
					room: mockRoom,
					failCode: GlobalFailCode.NONE_FAILCODE,
				},
			},
		};

		(getGamePacketType as jest.Mock).mockReturnValue(mockGamePacket.payload);
		(joinRoomUseCase as jest.Mock).mockResolvedValue(mockReturnGamePacket);
		(sendData as jest.Mock).mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('요청을 성공적으로 처리하고 응답을 전송해야 함', async () => {
		await joinRoomHandler(mockSocket as GameSocket, mockGamePacket);

		expect(getGamePacketType).toHaveBeenCalledWith(mockGamePacket, GamePacketType.joinRoomRequest);
		expect(joinRoomUseCase).toHaveBeenCalledWith(mockSocket, mockPayloadJoinRoom);

		expect(sendData).toHaveBeenCalledWith(
			mockSocket,
			mockReturnGamePacket,
			GamePacketType.joinRoomResponse,
		);
	});

	it('payload가 없으면 아무 작업도 수행하지 않아야 함', async () => {
		(getGamePacketType as jest.Mock).mockReturnValue(null);

		await joinRoomHandler(mockSocket as GameSocket, mockGamePacket);

		expect(joinRoomUseCase).not.toHaveBeenCalled();
		expect(sendData).not.toHaveBeenCalled();
	});

	it('socket.userId가 없으면 아무 작업도 수행하지 않아야 함', async () => {
		mockSocket.userId = undefined;

		await joinRoomHandler(mockSocket as GameSocket, mockGamePacket);

		expect(joinRoomUseCase).not.toHaveBeenCalled();
		expect(sendData).not.toHaveBeenCalled();
	});
});
