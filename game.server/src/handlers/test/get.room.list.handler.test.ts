import getRoomListRequestHandler from '../get.room.list.handler';
import { GameSocket } from '../../type/game.socket.js';
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { sendData } from '../../utils/send.data.js';
import getRoomListUseCase from '../../useCase/get.room.list/get.room.list.usecase.js';
import { GamePacketType } from '../../enums/gamePacketType.js';
import { C2SGetRoomListRequest, S2CGetRoomListResponse } from '../../generated/packet/room_actions';

jest.mock('../../utils/type.converter.js');
jest.mock('../../useCase/get.room.list/get.room.list.usecase.js');
jest.mock('../../utils/send.data.js');

describe('getRoomListRequestHandler', () => {
	let mockSocket: Partial<GameSocket>;
	let mockGamePacket: GamePacket;

	beforeEach(() => {
		mockSocket = {
			userId: '1',
		};
		mockGamePacket = {
			payload: {
				oneofKind: GamePacketType.getRoomListRequest,
				getRoomListRequest: {},
			},
		};

		(getGamePacketType as jest.Mock).mockReturnValue(mockGamePacket.payload);
		(getRoomListUseCase as jest.Mock).mockReturnValue({
			payload: { oneofKind: GamePacketType.getRoomListResponse, getRoomListResponse: { rooms: [] } },
		});
		(sendData as jest.Mock).mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('요청을 성공적으로 처리하고 응답을 전송해야 함', async () => {
		const req: C2SGetRoomListRequest={}; 

		await getRoomListRequestHandler(mockSocket as GameSocket, mockGamePacket);

		expect(getGamePacketType).toHaveBeenCalledWith(
			mockGamePacket,
			GamePacketType.getRoomListRequest,
		);
		expect(getRoomListUseCase).toHaveBeenCalledWith(mockSocket, req);
		expect(sendData).toHaveBeenCalledWith(
			mockSocket,
			expect.objectContaining({
				payload: {
					oneofKind: GamePacketType.getRoomListResponse,
					getRoomListResponse: {
						rooms: [],
					},
				},
			}),
			GamePacketType.getRoomListResponse,
		);
	});

	it('payload가 없으면 아무 작업도 수행하지 않아야 함', async () => {
		(getGamePacketType as jest.Mock).mockReturnValue(null);

		await getRoomListRequestHandler(mockSocket as GameSocket, mockGamePacket);

		expect(getRoomListUseCase).not.toHaveBeenCalled();
		expect(sendData).not.toHaveBeenCalled();
	});

	it('socket.userId가 없으면 아무 작업도 수행하지 않아야 함', async () => {
		mockSocket.userId = undefined;

		await getRoomListRequestHandler(mockSocket as GameSocket, mockGamePacket);

		expect(getRoomListUseCase).not.toHaveBeenCalled();
		expect(sendData).not.toHaveBeenCalled();
	});
});
