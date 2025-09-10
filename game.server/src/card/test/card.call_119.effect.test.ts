import cardCall119Effect from '../card.call_119.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/redis.util';
import { CharacterType, RoleType } from '../../generated/common/enums';

// Mock 설정
jest.mock('../../utils/redis.util', () => ({
  getUserFromRoom: jest.fn(),
  updateCharacterFromRoom: jest.fn(),
}));

const mockGetUserFromRoom = getUserFromRoom as jest.MockedFunction<typeof getUserFromRoom>;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.MockedFunction<typeof updateCharacterFromRoom>;

describe('cardCall119Effect', () => {
  const roomId = 1;
  const userId = 'user1';
  const targetUserId = 'user2';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('유효성 검증', () => {
    it('사용자가 없으면 함수가 종료된다', async () => {
      mockGetUserFromRoom.mockResolvedValue(null);

      await cardCall119Effect(roomId, userId, targetUserId);

      expect(mockGetUserFromRoom).toHaveBeenCalledWith(roomId, userId);
      expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
    });

    it('사용자의 캐릭터가 없으면 함수가 종료된다', async () => {
      const user = { id: userId, nickname: 'testUser' };
      mockGetUserFromRoom.mockResolvedValue(user);

      await cardCall119Effect(roomId, userId, targetUserId);

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

      await cardCall119Effect(roomId, userId, targetUserId);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[119 호출] 대상 유저 user2의 캐릭터 정보가 없습니다.'
      );
      expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('체력 회복 로직', () => {
    const createMockCharacter = (characterType: CharacterType, hp: number) => ({
      characterType,
      roleType: RoleType.TARGET,
      hp,
      weapon: 0,
      equips: [],
      debuffs: [],
      handCards: [],
      bbangCount: 0,
      handCardsCount: 0,
    });

    it('자신의 체력을 1 회복한다 (targetUserId가 빈 문자열인 경우)', async () => {
      const user = {
        id: userId,
        nickname: 'user1',
        character: createMockCharacter(CharacterType.RED, 2),
      };

      mockGetUserFromRoom.mockResolvedValue(user);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cardCall119Effect(roomId, userId, '');

      expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
        ...user.character,
        hp: 3,
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[119 호출] user1의 체력이 2 → 3로 회복되었습니다. (최대: 4)'
      );

      consoleSpy.mockRestore();
    });

    it('다른 플레이어의 체력을 1 회복한다', async () => {
      const user = {
        id: userId,
        nickname: 'user1',
        character: createMockCharacter(CharacterType.RED, 4),
      };
      const target = {
        id: targetUserId,
        nickname: 'user2',
        character: createMockCharacter(CharacterType.SHARK, 2),
      };

      mockGetUserFromRoom
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(target);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cardCall119Effect(roomId, userId, targetUserId);

      expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, targetUserId, {
        ...target.character,
        hp: 3,
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[119 호출] user2의 체력이 2 → 3로 회복되었습니다. (최대: 4)'
      );

      consoleSpy.mockRestore();
    });

    it('최대 체력에 도달한 경우 회복하지 않는다', async () => {
      const user = {
        id: userId,
        nickname: 'user1',
        character: createMockCharacter(CharacterType.RED, 4), // 최대 체력
      };

      mockGetUserFromRoom.mockResolvedValue(user);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cardCall119Effect(roomId, userId, '');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[119 호출] user1의 체력이 이미 최대치(4)입니다.'
      );
      expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('공룡이 캐릭터의 최대 체력(3)을 초과하지 않는다', async () => {
      const user = {
        id: userId,
        nickname: 'user1',
        character: createMockCharacter(CharacterType.DINOSAUR, 2),
      };

      mockGetUserFromRoom.mockResolvedValue(user);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cardCall119Effect(roomId, userId, '');

      expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
        ...user.character,
        hp: 3, // 최대 체력 3에 제한됨
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[119 호출] user1의 체력이 2 → 3로 회복되었습니다. (최대: 3)'
      );

      consoleSpy.mockRestore();
    });

    it('핑크슬라임 캐릭터의 최대 체력(3)을 초과하지 않는다', async () => {
      const user = {
        id: userId,
        nickname: 'user1',
        character: createMockCharacter(CharacterType.PINK_SLIME, 2),
      };

      mockGetUserFromRoom.mockResolvedValue(user);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cardCall119Effect(roomId, userId, '');

      expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, {
        ...user.character,
        hp: 3, // 최대 체력 3에 제한됨
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[119 호출] user1의 체력이 2 → 3로 회복되었습니다. (최대: 3)'
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
          hp: 2,
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

      // 에러가 발생해도 함수가 정상적으로 처리되는지 확인
      await expect(cardCall119Effect(roomId, userId, '')).resolves.not.toThrow();

      consoleSpy.mockRestore();
    });
  });
});
