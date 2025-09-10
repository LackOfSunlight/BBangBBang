import cardHandGunEffect from '../card.hand_gun.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/redis.util';
import { CharacterType, RoleType } from '../../generated/common/enums';

// Mock 설정
jest.mock('../../utils/redis.util', () => ({
  getUserFromRoom: jest.fn(),
  updateCharacterFromRoom: jest.fn(),
}));

const mockGetUserFromRoom = getUserFromRoom as jest.MockedFunction<typeof getUserFromRoom>;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.MockedFunction<typeof updateCharacterFromRoom>;

describe('cardHandGunEffect', () => {
  const roomId = 1;
  const userId = 'user1';
  const targetUserId = 'user2';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('유효성 검증', () => {
    it('사용자가 없으면 함수가 종료된다', async () => {
      mockGetUserFromRoom.mockResolvedValue(null);

      await cardHandGunEffect(roomId, userId, targetUserId);

      expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
      expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
    });

    it('사용자의 캐릭터가 없으면 함수가 종료된다', async () => {
      const user = { id: userId, nickname: 'testUser' };
      mockGetUserFromRoom.mockResolvedValue(user);

      await cardHandGunEffect(roomId, userId, targetUserId);

      expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
      expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
    });

    it('대상 사용자의 캐릭터가 없으면 경고 로그를 출력하고 함수가 종료된다', async () => {
      const user = {
        id: userId,
        nickname: 'user1',
        character: {
          characterType: CharacterType.RED,
          roleType: RoleType.TARGET,
          hp: 3,
          weapon: 0,
          equips: [],
          debuffs: [],
          handCards: [],
          bbangCount: 0,
          handCardsCount: 0,
        },
      };
      const target = { id: targetUserId, nickname: 'user2' };

      mockGetUserFromRoom
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(target);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await cardHandGunEffect(roomId, userId, targetUserId);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[핸드건] 대상 유저 user2의 캐릭터 정보가 없습니다.'
      );
      expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('무기 장착 로직', () => {
    const createMockCharacter = (weapon: number) => ({
      characterType: CharacterType.RED,
      roleType: RoleType.TARGET,
      hp: 3,
      weapon,
      equips: [],
      debuffs: [],
      handCards: [],
      bbangCount: 0,
      handCardsCount: 0,
    });

    it('자신에게 핸드건을 장착한다 (targetUserId가 빈 문자열인 경우)', async () => {
      const user = {
        id: userId,
        nickname: 'user1',
        character: createMockCharacter(0), // 무기 없음
      };

      mockGetUserFromRoom.mockResolvedValue(user);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cardHandGunEffect(roomId, userId, '');

      expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
        ...user.character,
        weapon: 14, // 핸드건 ID
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[핸드건] user1이 핸드건을 장착했습니다. (이전 무기: 0)'
      );

      consoleSpy.mockRestore();
    });

    it('다른 플레이어에게 핸드건을 장착한다', async () => {
      const user = {
        id: userId,
        nickname: 'user1',
        character: createMockCharacter(0),
      };
      const target = {
        id: targetUserId,
        nickname: 'user2',
        character: createMockCharacter(1), // 다른 무기 장착 중
      };

      mockGetUserFromRoom
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(target);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cardHandGunEffect(roomId, userId, targetUserId);

      expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, targetUserId, {
        ...target.character,
        weapon: 14, // 핸드건 ID
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[핸드건] user2이 핸드건을 장착했습니다. (이전 무기: 1)'
      );

      consoleSpy.mockRestore();
    });

    it('이미 핸드건을 장착한 경우 장착하지 않는다', async () => {
      const user = {
        id: userId,
        nickname: 'user1',
        character: createMockCharacter(14), // 이미 핸드건 장착
      };

      mockGetUserFromRoom.mockResolvedValue(user);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cardHandGunEffect(roomId, userId, '');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[핸드건] user1은 이미 핸드건을 장착하고 있습니다.'
      );
      expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('다른 무기를 핸드건으로 교체한다', async () => {
      const user = {
        id: userId,
        nickname: 'user1',
        character: createMockCharacter(13), // 스나이퍼 건 장착 중
      };

      mockGetUserFromRoom.mockResolvedValue(user);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cardHandGunEffect(roomId, userId, '');

      expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
        ...user.character,
        weapon: 14, // 핸드건으로 교체
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[핸드건] user1이 핸드건을 장착했습니다. (이전 무기: 13)'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('에러 처리', () => {
    it('updateCharacterFromRoom에서 에러가 발생해도 함수가 정상적으로 처리된다', async () => {
      const user = {
        id: userId,
        nickname: 'user1',
        character: {
          characterType: CharacterType.RED,
          roleType: RoleType.TARGET,
          hp: 3,
          weapon: 0,
          equips: [],
          debuffs: [],
          handCards: [],
          bbangCount: 0,
          handCardsCount: 0,
        },
      };

      mockGetUserFromRoom.mockResolvedValue(user);
      mockUpdateCharacterFromRoom.mockRejectedValue(new Error('Redis error'));

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // 에러가 발생해도 함수가 정상적으로 처리되는지 확인
      await expect(cardHandGunEffect(roomId, userId, '')).resolves.not.toThrow();

      // 에러 로그가 출력되는지 확인
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[핸드건] Redis 업데이트 실패:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});
