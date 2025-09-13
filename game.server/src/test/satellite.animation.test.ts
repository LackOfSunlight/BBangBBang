/**
 * 위성타겟 애니메이션 테스트
 * 
 * 이 테스트는 위성타겟 카드 효과에서 애니메이션이 올바르게 전송되는지 검증합니다.
 */

// Mock 함수들
const mockGetUserFromRoom = jest.fn();
const mockGetRoom = jest.fn();
const mockUpdateCharacterFromRoom = jest.fn();
const mockSendAnimationNotification = jest.fn();

// 모듈 모킹
jest.mock('../utils/redis.util.js', () => ({
  getUserFromRoom: mockGetUserFromRoom,
  getRoom: mockGetRoom,
  updateCharacterFromRoom: mockUpdateCharacterFromRoom,
}));

jest.mock('../handlers/notification/animation.notification.handler.js', () => ({
  sendAnimationNotification: mockSendAnimationNotification,
}));

import cardSatelliteTargetEffect from '../card/card.satellite_target.effect.js';
import { AnimationType } from '../generated/common/enums.js';

describe('위성타겟 애니메이션 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Math.random을 모킹하여 3% 확률로 효과 발동하도록 설정
    jest.spyOn(Math, 'random').mockReturnValue(0.02); // 3% 미만이므로 효과 발동
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('위성타겟 효과 발동 시 애니메이션을 전송해야 함', async () => {
    // Given
    const roomId = 1;
    const userId = 'player1';
    const targetUserId = 'player2';
    
    const mockTarget = {
      id: targetUserId,
      nickname: 'Player2',
      character: {
        hp: 5,
        debuffs: []
      }
    };

    const mockRoom = {
      id: roomId,
      users: [
        { id: 'player1', nickname: 'Player1' },
        { id: 'player2', nickname: 'Player2' },
        { id: 'player3', nickname: 'Player3' },
      ]
    };

    mockGetUserFromRoom.mockResolvedValue(mockTarget);
    mockGetRoom.mockResolvedValue(mockRoom);
    mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

    // When
    await cardSatelliteTargetEffect(roomId, userId, targetUserId);

    // Then
    expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, targetUserId);
    expect(mockGetRoom).toHaveBeenCalledWith(roomId);
    expect(mockSendAnimationNotification).toHaveBeenCalledWith(
      mockRoom.users,
      targetUserId,
      AnimationType.SATELLITE_TARGET_ANIMATION
    );
    expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, targetUserId, {
      ...mockTarget.character,
      hp: 2 // 5 - 3 = 2
    });
  });

  it('위성타겟 효과 미발동 시 애니메이션을 전송하지 않아야 함', async () => {
    // Given
    const roomId = 1;
    const userId = 'player1';
    const targetUserId = 'player2';
    
    // Math.random을 3% 이상으로 설정하여 효과 미발동
    jest.spyOn(Math, 'random').mockReturnValue(0.05);
    
    const mockTarget = {
      id: targetUserId,
      nickname: 'Player2',
      character: {
        hp: 5,
        debuffs: [22] // SATELLITE_TARGET
      }
    };

    const mockRoom = {
      id: roomId,
      users: [
        { id: 'player1', nickname: 'Player1' },
        { id: 'player2', nickname: 'Player2' },
        { id: 'player3', nickname: 'Player3' },
      ]
    };

    mockGetUserFromRoom.mockResolvedValue(mockTarget);
    mockGetRoom.mockResolvedValue(mockRoom);
    mockUpdateCharacterFromRoom.mockResolvedValue(undefined);

    // When
    await cardSatelliteTargetEffect(roomId, userId, targetUserId);

    // Then
    expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, targetUserId);
    expect(mockGetRoom).toHaveBeenCalledWith(roomId);
    expect(mockSendAnimationNotification).not.toHaveBeenCalled();
    expect(mockUpdateCharacterFromRoom).toHaveBeenCalled();
  });

  it('타겟을 찾을 수 없으면 아무것도 하지 않아야 함', async () => {
    // Given
    const roomId = 1;
    const userId = 'player1';
    const targetUserId = 'player2';
    
    mockGetUserFromRoom.mockResolvedValue(null);

    // When
    await cardSatelliteTargetEffect(roomId, userId, targetUserId);

    // Then
    expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, targetUserId);
    expect(mockGetRoom).not.toHaveBeenCalled();
    expect(mockSendAnimationNotification).not.toHaveBeenCalled();
    expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
  });
});