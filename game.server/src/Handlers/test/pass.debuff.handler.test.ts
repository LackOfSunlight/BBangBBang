import passDebuffHandler from '../pass.debuff.handler';
import { GameSocket } from '../../Type/game.socket';
import { GamePacket } from '../../Generated/gamePacket';
import { GamePacketType } from '../../Enums/gamePacketType';
import { CardType, GlobalFailCode } from '../../Generated/common/enums';
import passDebuffUseCase from '../../UseCase/pass.debuff/pass.debuff.usecase';
import { getGamePacketType } from '../../Converter/type.form';
import { sendData } from '../../Sockets/send.data';

// Mock 설정
jest.mock('../../useCase/pass.debuff/pass.debuff.usecase');
jest.mock('../../utils/send.data');
jest.mock('../../utils/type.converter');

const mockPassDebuffUseCase = passDebuffUseCase as jest.MockedFunction<typeof passDebuffUseCase>;
const mockGetGamePacketType = getGamePacketType as unknown as jest.Mock;
const mockSendData = sendData as unknown as jest.Mock;

// 에러 로그 출력 억제
beforeAll(() => {
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
	jest.restoreAllMocks();
});

describe('passDebuffHandler', () => {
	let mockSocket: Partial<GameSocket>;
	let mockGamePacket: GamePacket;

	beforeEach(() => {
		// Mock 소켓 설정 (다른 테스트들과 동일하게 Partial 사용)
		mockSocket = {
			userId: 'user-123',
			roomId: 1,
		};

		// Mock 패킷 설정
		mockGamePacket = {
			payload: {
				oneofKind: GamePacketType.passDebuffRequest,
				passDebuffRequest: {
					targetUserId: 'user-456',
					debuffCardType: CardType.DEATH_MATCH,
				},
			},
		} as GamePacket;

		jest.clearAllMocks();
		mockSendData.mockImplementation(() => {});
	});

	describe('성공 케이스', () => {
		it('디버프 전달이 성공적으로 처리되어야 함', async () => {
			// Given
			const mockUseCaseResult = {
				payload: {
					oneofKind: 'passDebuffResponse' as const,
					passDebuffResponse: {
						success: true,
						failCode: GlobalFailCode.NONE_FAILCODE,
					},
				},
			} as GamePacket;

			mockPassDebuffUseCase.mockResolvedValue(mockUseCaseResult);

			// When
			mockGetGamePacketType.mockReturnValue(mockGamePacket.payload);
			await passDebuffHandler(mockSocket as GameSocket, mockGamePacket);

			// Then
			expect(mockPassDebuffUseCase).toHaveBeenCalledWith(mockSocket, {
				targetUserId: 'user-456',
				debuffCardType: CardType.DEATH_MATCH,
			});
			expect(mockSendData).toHaveBeenCalledWith(
				mockSocket,
				mockUseCaseResult,
				GamePacketType.passDebuffResponse,
			);
		});
	});

	describe('실패 케이스', () => {
		it('방을 찾을 수 없는 경우 실패해야 함', async () => {
			// Given
			const mockUseCaseResult = {
				payload: {
					oneofKind: 'passDebuffResponse' as const,
					passDebuffResponse: {
						success: false,
						failCode: GlobalFailCode.ROOM_NOT_FOUND,
					},
				},
			} as GamePacket;

			mockPassDebuffUseCase.mockResolvedValue(mockUseCaseResult);

			// When
			mockGetGamePacketType.mockReturnValue(mockGamePacket.payload);
			await passDebuffHandler(mockSocket as GameSocket, mockGamePacket);

			// Then
			expect(mockPassDebuffUseCase).toHaveBeenCalled();
			expect(mockSendData).toHaveBeenCalledWith(
				mockSocket,
				mockUseCaseResult,
				GamePacketType.passDebuffResponse,
			);
		});

		it('디버프 카드를 가지고 있지 않은 경우 실패해야 함', async () => {
			// Given
			const mockUseCaseResult = {
				payload: {
					oneofKind: 'passDebuffResponse' as const,
					passDebuffResponse: {
						success: false,
						failCode: GlobalFailCode.CHARACTER_NO_CARD,
					},
				},
			} as GamePacket;

			mockPassDebuffUseCase.mockResolvedValue(mockUseCaseResult);

			// When
			mockGetGamePacketType.mockReturnValue(mockGamePacket.payload);
			await passDebuffHandler(mockSocket as GameSocket, mockGamePacket);

			// Then
			expect(mockPassDebuffUseCase).toHaveBeenCalled();
			expect(mockSendData).toHaveBeenCalledWith(
				mockSocket,
				mockUseCaseResult,
				GamePacketType.passDebuffResponse,
			);
		});

		it('payload가 없으면 아무 작업도 수행하지 않아야 함', async () => {
			// Given
			mockGetGamePacketType.mockReturnValue(null);

			// When
			await passDebuffHandler(mockSocket as GameSocket, mockGamePacket);

			// Then
			expect(mockPassDebuffUseCase).not.toHaveBeenCalled();
			expect(mockSendData).not.toHaveBeenCalled();
		});
	});

	describe('에러 처리', () => {
		it('UseCase에서 에러가 발생한 경우 에러가 전파되어야 함', async () => {
			// Given
			mockPassDebuffUseCase.mockRejectedValue(new Error('Database error'));

			// When & Then
			mockGetGamePacketType.mockReturnValue(mockGamePacket.payload);
			await expect(passDebuffHandler(mockSocket as GameSocket, mockGamePacket)).rejects.toThrow(
				'Database error',
			);
			expect(mockPassDebuffUseCase).toHaveBeenCalled();
		});
	});
});
