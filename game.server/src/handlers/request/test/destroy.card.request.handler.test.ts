// import destroyCardRequestHandler from '../destroy.card.request.handler';
// import { GameSocket } from '../../../type/game.socket';
// import { GamePacket } from '../../../generated/gamePacket';
// import { getGamePacketType } from '../../../utils/type.converter';
// import { getUserFromRoom, updateCharacterFromRoom } from '../../../utils/redis.util';
// import destroyCardResponseHandler from '../../response/destroy.card.response.handler';
// import { User } from '../../../models/user.model';
// import { CharacterData } from '../../../generated/common/types';
// import {
// 	CardType,
// 	CharacterStateType,
// 	CharacterType,
// 	RoleType,
// } from '../../../generated/common/enums';

// // Mock dependencies
// jest.mock('../../../utils/redis.util');
// jest.mock('../../response/destroy.card.response.handler');
// jest.mock('../../../utils/type.converter');

// const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
// const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;
// const mockDestroyCardResponseHandler = destroyCardResponseHandler as jest.Mock;
// const mockGetGamePacketType = getGamePacketType as jest.Mock;

// describe('destroyCardRequestHandler', () => {
// 	let mockSocket: Partial<GameSocket>;
// 	let mockUser: User;
// 	let mockCharacter: CharacterData;

// 	// 초기값 세팅
// 	beforeEach(() => {
// 		jest.clearAllMocks();

// 		mockSocket = {
// 			userId: '1',
// 			roomId: 1,
// 		};

// 		mockCharacter = {
// 			characterType: CharacterType.RED,
// 			roleType: RoleType.HITMAN,
// 			hp: 4,
// 			weapon: 0,
// 			stateInfo: {
// 				state: CharacterStateType.NONE_CHARACTER_STATE,
// 				nextState: CharacterStateType.NONE_CHARACTER_STATE,
// 				nextStateAt: '0',
// 				stateTargetUserId: '0',
// 			},
// 			equips: [],
// 			debuffs: [],
// 			handCards: [
// 				{ type: CardType.HAND_GUN, count: 2 },
// 				{ type: CardType.BOMB, count: 1 },
// 			],
// 			bbangCount: 0,
// 			handCardsCount: 3,
// 		};

// 		mockUser = {
// 			id: '1',
// 			nickname: 'akaka',
// 			character: mockCharacter,
// 		};

// 		mockGetUserFromRoom.mockResolvedValue(mockUser);
// 	});

// 	test('카드 삭제하고 유저 상태 업데이트', async () => {
// 		const mockPacket: GamePacket = {
// 			payload: {
// 				oneofKind: 'destroyCardRequest',
// 				destroyCardRequest: {
// 					destroyCards: [{ type: CardType.HAND_GUN, count: 1 }],
// 				},
// 			},
// 		};
// 		mockGetGamePacketType.mockReturnValue(mockPacket.payload);

// 		await destroyCardRequestHandler(mockSocket as GameSocket, mockPacket);

//         // 방에서 유저 가져왔는지 확인
// 		expect(mockGetUserFromRoom).toHaveBeenCalledWith(1, '1');

// 		const expectedHandCards = [
// 			{ type: CardType.HAND_GUN, count: 1 },
// 			{ type: CardType.BOMB, count: 1 },
// 		];
// 		const expectedCharacter = {
// 			...mockCharacter,
// 			handCards: expectedHandCards,
// 			handCardsCount: 2,
// 		};

// 		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(1, '1', expectedCharacter);
// 		expect(mockDestroyCardResponseHandler).toHaveBeenCalled();
// 		const responsePacket = mockDestroyCardResponseHandler.mock.calls[0][1]; // destroyCardResponseHandler에 2번째 인자 gamePacket
// 		expect(responsePacket.payload.oneofKind).toBe('destroyCardResponse');
// 		expect(responsePacket.payload.destroyCardResponse.handCards).toEqual(expectedHandCards);
// 	});

// 	test('카드 0이면 핸드에 카드가 사라져야함', async () => {
// 		const mockPacket: GamePacket = {
// 			payload: {
// 				oneofKind: 'destroyCardRequest',
// 				destroyCardRequest: {
// 					destroyCards: [{ type: CardType.BOMB, count: 1 }],
// 				},
// 			},
// 		};
// 		mockGetGamePacketType.mockReturnValue(mockPacket.payload);

// 		await destroyCardRequestHandler(mockSocket as GameSocket, mockPacket);

// 		const expectedHandCards = [{ type: CardType.HAND_GUN, count: 2 }];
// 		const expectedCharacter = {
// 			...mockCharacter,
// 			handCards: expectedHandCards,
// 			handCardsCount: 2,
// 		};

// 		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith( 1, '1', expectedCharacter);
// 		expect(mockDestroyCardResponseHandler).toHaveBeenCalled();
// 		const responsePacket = mockDestroyCardResponseHandler.mock.calls[0][1];
// 		expect(responsePacket.payload.destroyCardResponse.handCards).toEqual(expectedHandCards);
// 	});

// 	test('파괴 할 카드가 없으면 호출 안됨', async () => {
// 		const mockPacket: GamePacket = {
// 			payload: {
// 				oneofKind: 'destroyCardRequest',
// 				destroyCardRequest: {
// 					destroyCards: [{ type: CardType.SNIPER_GUN, count: 1 }],
// 				},
// 			},
// 		};
// 		mockGetGamePacketType.mockReturnValue(mockPacket.payload);

// 		await destroyCardRequestHandler(mockSocket as GameSocket, mockPacket);

// 		// Character should remain unchanged
// 		const expectedCharacter = {
// 			...mockCharacter,
// 			handCards: [
// 				{ type: CardType.HAND_GUN, count: 2 },
// 				{ type: CardType.BOMB, count: 1 },
// 			],
// 			handCardsCount: 3,
// 		};

// 		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(1 , '1', expectedCharacter);
// 		expect(mockDestroyCardResponseHandler).toHaveBeenCalled();
// 	});

// 	test('소켓이 없으면 실행 안됨', async () => {
// 		const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
// 		mockGetGamePacketType.mockReturnValue(undefined);

// 		await destroyCardRequestHandler(mockSocket as GameSocket, {} as GamePacket);

// 		expect(consoleSpy).toHaveBeenCalledWith('소켓과 패킷이 전달되지 않았습니다.');
// 		expect(mockGetUserFromRoom).not.toHaveBeenCalled();
// 		consoleSpy.mockRestore();
// 	});

// 	test('방에 유저가 없으면 실행 안됨', async () => {
// 		const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
// 		mockGetUserFromRoom.mockResolvedValue(null);
// 		const mockPacket: GamePacket = {
// 			payload: {
// 				oneofKind: 'destroyCardRequest',
// 				destroyCardRequest: {
// 					destroyCards: [],
// 				},
// 			},
// 		};
// 		mockGetGamePacketType.mockReturnValue(mockPacket.payload);

// 		await destroyCardRequestHandler(mockSocket as GameSocket, mockPacket);

// 		expect(consoleSpy).toHaveBeenCalledWith('해당 유저가 존재하지 않습니다.');
// 		expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
// 		consoleSpy.mockRestore();
// 	});
// });
