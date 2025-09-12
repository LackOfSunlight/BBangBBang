import { sendAnimationNotification } from '../animation.notification.handler';
import { broadcastDataToRoom } from '../../../utils/notification.util';
import { UserData } from '../../../generated/common/types';
import { AnimationType } from '../../../generated/common/enums';
import { GamePacketType } from '../../../enums/gamePacketType';
import { GamePacket } from '../../../generated/gamePacket';

// Mock the notification util
jest.mock('../../../utils/notification.util', () => ({
    __esModule: true,
    broadcastDataToRoom: jest.fn(),
}));

describe('sendAnimationNotification', () => {
    const mockBroadcastDataToRoom = broadcastDataToRoom as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('애니메이션 알림 패킷으로 broadcastDataToRoom을 호출해야 합니다.', () => {
        // Arrange
        const users: UserData[] = [
            { id: 'user-1', nickname: 'user1' } as UserData,
            { id: 'user-2', nickname: 'user2' } as UserData,
        ];
        const userId = 'user-1';
        const animationType = AnimationType.SHIELD_ANIMATION;

        const expectedPacket: GamePacket = {
            payload: {
                oneofKind: GamePacketType.animationNotification,
                animationNotification: {
                    userId: userId,
                    animationType: animationType,
                },
            },
        };

        // Act
        sendAnimationNotification(users, userId, animationType);

        // Assert
        expect(mockBroadcastDataToRoom).toHaveBeenCalledTimes(1);
        expect(mockBroadcastDataToRoom).toHaveBeenCalledWith(
            users,
            expectedPacket,
            GamePacketType.animationNotification
        );
    });
});
