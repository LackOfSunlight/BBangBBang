import passDebuffUseCase from './pass.debuff.usecase';
import { getRoom, updateCharacterFromRoom } from '../../Utils/room.utils';
import { CardType, GlobalFailCode } from '../../generated/common/enums';
import { GamePacketType } from '../../Enums/gamePacketType';
import { Room } from '../../Models/room.model';
import { User } from '../../Models/user.model';
import { Character } from '../../Models/character.model';
import { GameSocket } from '../../Type/game.socket';

// Mock 설정
jest.mock('../../utils/room.utils');

const mockGetRoom = getRoom as jest.MockedFunction<typeof getRoom>;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.MockedFunction<
	typeof updateCharacterFromRoom
>;

describe('passDebuffUseCase', () => {
	let mockSocket: GameSocket;
	let mockRequest: any;
	let mockRoom: Room;
	let mockFromUser: User;
	let mockToUser: User;

	beforeEach(() => {
		// Mock 유저 생성
		mockFromUser = {
			id: 'user-123',
			nickname: 'fromUser',
			character: new Character(
				1, // CharacterType
				1, // RoleType
				100, // hp
				0, // weapon
				[], // equips
				[CardType.DEATH_MATCH, CardType.HALLUCINATION], // debuffs
				[], // handCards
				0, // bbangCount
				0, // handCardsCount
			),
		};

		mockToUser = {
			id: 'user-456',
			nickname: 'toUser',
			character: new Character(
				1, // CharacterType
				1, // RoleType
				100, // hp
				0, // weapon
				[], // equips
				[], // debuffs (빈 배열)
				[], // handCards
				0, // bbangCount
				0, // handCardsCount
			),
		};

		// Mock 방 생성
		mockRoom = {
			id: 1,
			ownerId: 'user-123',
			name: 'Test Room',
			maxUserNum: 4,
			state: 0, // WAIT
			users: [mockFromUser, mockToUser],
		} as Room;

		// Mock 소켓 생성
		mockSocket = {
			id: 'socket-123',
			userId: 'user-123',
			roomId: '1',
			user: mockFromUser,
		} as GameSocket;

		// Mock 요청 생성
		mockRequest = {
			targetUserId: 'user-456',
			debuffCardType: CardType.DEATH_MATCH,
		};

		jest.clearAllMocks();
	});

	describe('성공 케이스', () => {
		it('디버프 전달이 성공적으로 처리되어야 함', async () => {
			// Given
			mockGetRoom.mockReturnValue(mockRoom);

			// When
			const result = await passDebuffUseCase(mockSocket, mockRequest);

			// Then
			expect(result.payload.oneofKind).toBe(GamePacketType.passDebuffResponse);
			if (result.payload.oneofKind === GamePacketType.passDebuffResponse) {
				expect(result.payload.passDebuffResponse.success).toBe(true);
				expect(result.payload.passDebuffResponse.failCode).toBe(GlobalFailCode.NONE_FAILCODE);
			}

			// updateCharacterFromRoom이 두 번 호출되어야 함 (제거 + 추가)
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(2);
		});
	});

	describe('실패 케이스', () => {
		it('방을 찾을 수 없는 경우 실패해야 함', async () => {
			// Given
			mockGetRoom.mockImplementation(() => {
				throw new Error('Room not found');
			});

			// When
			const result = await passDebuffUseCase(mockSocket, mockRequest);

			// Then
			expect(result.payload.oneofKind).toBe(GamePacketType.passDebuffResponse);
			if (result.payload.oneofKind === GamePacketType.passDebuffResponse) {
				expect(result.payload.passDebuffResponse.success).toBe(false);
				expect(result.payload.passDebuffResponse.failCode).toBe(GlobalFailCode.ROOM_NOT_FOUND);
			}
		});

		it('요청자가 해당 디버프를 가지고 있지 않은 경우 실패해야 함', async () => {
			// Given
			const requestWithoutDebuff = {
				targetUserId: 'user-456',
				debuffCardType: CardType.BOMB, // 가지고 있지 않은 디버프
			};

			mockGetRoom.mockReturnValue(mockRoom);

			// When
			const result = await passDebuffUseCase(mockSocket, requestWithoutDebuff);

			// Then
			expect(result.payload.oneofKind).toBe(GamePacketType.passDebuffResponse);
			if (result.payload.oneofKind === GamePacketType.passDebuffResponse) {
				expect(result.payload.passDebuffResponse.success).toBe(false);
				expect(result.payload.passDebuffResponse.failCode).toBe(GlobalFailCode.CHARACTER_NO_CARD);
			}
		});

		it('소켓에 userId나 roomId가 없는 경우 실패해야 함', async () => {
			// Given
			const invalidSocket = { ...mockSocket, userId: undefined, roomId: undefined };

			// When
			const result = await passDebuffUseCase(invalidSocket, mockRequest);

			// Then
			expect(result.payload.oneofKind).toBe(GamePacketType.passDebuffResponse);
			if (result.payload.oneofKind === GamePacketType.passDebuffResponse) {
				expect(result.payload.passDebuffResponse.success).toBe(false);
				expect(result.payload.passDebuffResponse.failCode).toBe(GlobalFailCode.INVALID_REQUEST);
			}
		});
	});
});
