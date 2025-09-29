import getRoomListUseCase from './get.room.list.usecase';
import { GameSocket } from '../../Type/game.socket.js';
import { C2SGetRoomListRequest } from '../../Generated/packet/room_actions.js';
import { getRooms } from '../../Utils/room.utils.js';
import { Room } from '../../Models/room.model.js';
import { GamePacketType } from '../../Enums/gamePacketType.js';
import { RoomStateType } from '../../Generated/common/enums';

jest.mock('../../utils/room.utils.js');

describe('getRoomListUseCase', () => {
	const mockSocket: Partial<GameSocket> = {};
	const mockRequest: C2SGetRoomListRequest = {};

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('방 목록이 있을 때, 방 목록을 반환해야 함', () => {
		const mockRooms: Room[] = [
			{
				id: 1,
				ownerId: '1',
				name: 'testRoom',
				maxUserNum: 7,
				state: RoomStateType.WAIT,
				users: [],
			},
			{
				id: 2,
				ownerId: '2',
				name: 'testRoom',
				maxUserNum: 7,
				state: RoomStateType.WAIT,
				users: [],
			},
		];
		(getRooms as jest.Mock).mockReturnValue(mockRooms);

		const response = getRoomListUseCase(mockSocket as GameSocket, mockRequest);

		expect(getRooms).toHaveBeenCalled();
		expect(response.payload.oneofKind).toBe(GamePacketType.getRoomListResponse);
		if (response.payload.oneofKind === GamePacketType.getRoomListResponse) {
			expect(response.payload.getRoomListResponse.rooms).toEqual(mockRooms);
		}
	});

	it('방 목록이 없을 때, 빈 배열을 반환해야 함', () => {
		const mockRooms: Room[] = [];
		(getRooms as jest.Mock).mockReturnValue(mockRooms);

		const response = getRoomListUseCase(mockSocket as GameSocket, mockRequest);

		expect(getRooms).toHaveBeenCalled();
		expect(response.payload.oneofKind).toBe(GamePacketType.getRoomListResponse);
		if (response.payload.oneofKind === GamePacketType.getRoomListResponse) {
			expect(response.payload.getRoomListResponse.rooms).toEqual([]);
		}
	});
});
