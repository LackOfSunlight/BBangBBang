import passDebuffHandler from './pass.debuff.handler';
import passDebuffUseCase from '../useCase/pass.debuff/pass.debuff.usecase';
import { GameSocket } from '../type/game.socket';
import { GamePacket } from '../generated/gamePacket';
import { GamePacketType } from '../enums/gamePacketType';
import { GlobalFailCode } from '../generated/common/enums';

// Mock 설정
jest.mock('../useCase/pass.debuff/pass.debuff.usecase');
jest.mock('../utils/send.data');

const mockPassDebuffUseCase = passDebuffUseCase as jest.MockedFunction<typeof passDebuffUseCase>;

describe('passDebuffHandler', () => {
    let mockSocket: GameSocket;
    let mockGamePacket: GamePacket;

    beforeEach(() => {
        // Mock 소켓 설정
        mockSocket = {
            id: 'socket-123',
            userId: 'user-123',
            roomId: '1',
            user: {
                id: 'user-123',
                nickname: 'testuser',
                character: {
                    characterType: 1,
                    roleType: 1,
                    hp: 100,
                    weapon: 0,
                    equips: [],
                    debuffs: [CardType.DEATH_MATCH],
                    handCards: [],
                    bbangCount: 0,
                    handCardsCount: 0
                }
            }
        } as GameSocket;

        // Mock 패킷 설정
        mockGamePacket = {
            payload: {
                oneofKind: GamePacketType.passDebuffRequest,
                passDebuffRequest: {
                    targetUserId: 'user-456',
                    debuffCardType: CardType.DEATH_MATCH
                }
            }
        } as GamePacket;

        jest.clearAllMocks();
    });

    describe('성공 케이스', () => {
        it('디버프 전달이 성공적으로 처리되어야 함', async () => {
            // Given
            const mockUseCaseResult = {
                payload: {
                    oneofKind: GamePacketType.passDebuffResponse,
                    passDebuffResponse: {
                        success: true,
                        failCode: GlobalFailCode.NONE_FAILCODE
                    }
                }
            };

            mockPassDebuffUseCase.mockResolvedValue(mockUseCaseResult);

            // When
            await passDebuffHandler(mockSocket, mockGamePacket);

            // Then
            expect(mockPassDebuffUseCase).toHaveBeenCalledWith(mockSocket, {
                targetUserId: 'user-456',
                debuffCardType: CardType.DEATH_MATCH
            });
        });
    });

    describe('실패 케이스', () => {
        it('방을 찾을 수 없는 경우 실패해야 함', async () => {
            // Given
            const mockUseCaseResult = {
                payload: {
                    oneofKind: GamePacketType.passDebuffResponse,
                    passDebuffResponse: {
                        success: false,
                        failCode: GlobalFailCode.ROOM_NOT_FOUND
                    }
                }
            };

            mockPassDebuffUseCase.mockResolvedValue(mockUseCaseResult);

            // When
            await passDebuffHandler(mockSocket, mockGamePacket);

            // Then
            expect(mockPassDebuffUseCase).toHaveBeenCalled();
        });

        it('디버프 카드를 가지고 있지 않은 경우 실패해야 함', async () => {
            // Given
            const mockUseCaseResult = {
                payload: {
                    oneofKind: GamePacketType.passDebuffResponse,
                    passDebuffResponse: {
                        success: false,
                        failCode: GlobalFailCode.CHARACTER_NO_CARD
                    }
                }
            };

            mockPassDebuffUseCase.mockResolvedValue(mockUseCaseResult);

            // When
            await passDebuffHandler(mockSocket, mockGamePacket);

            // Then
            expect(mockPassDebuffUseCase).toHaveBeenCalled();
        });

        it('잘못된 요청인 경우 실패해야 함', async () => {
            // Given
            mockSocket.userId = undefined;
            mockSocket.roomId = undefined;

            // When
            await passDebuffHandler(mockSocket, mockGamePacket);

            // Then
            expect(mockPassDebuffUseCase).not.toHaveBeenCalled();
        });
    });

    describe('에러 처리', () => {
        it('UseCase에서 에러가 발생한 경우 적절히 처리되어야 함', async () => {
            // Given
            mockPassDebuffUseCase.mockRejectedValue(new Error('Database error'));

            // When
            await passDebuffHandler(mockSocket, mockGamePacket);

            // Then
            expect(mockPassDebuffUseCase).toHaveBeenCalled();
        });
    });
});
