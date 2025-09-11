// card.bbang.effect.test.ts
import cardBbangEffect from "../card.bbang.effect"; 
import { getUserFromRoom, updateCharacterFromRoom, getRoom } from "../../utils/redis.util.js";
import { CharacterStateType } from "../../generated/common/enums.js";

// jest mock
jest.mock("../../utils/redis.util.js", () => ({
  getUserFromRoom: jest.fn(),
  updateCharacterFromRoom: jest.fn(),
  getRoom: jest.fn(),
}));

describe("cardBbangEffect", () => {
  const mockRoomId = 1;
  const mockUserId = "user1";
  const mockTargetId = "user2";

  let mockUser: any;
  let mockTarget: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      character: {
        hp: 10,
        stateInfo: {
          state: CharacterStateType.NONE_CHARACTER_STATE,
          nextState: CharacterStateType.NONE_CHARACTER_STATE,
          nextStateAt: null,
          stateTargetUserId: null,
        },
      },
    };

    mockTarget = {
      character: {
        hp: 10,
        stateInfo: {
          state: CharacterStateType.NONE_CHARACTER_STATE,
          nextState: CharacterStateType.NONE_CHARACTER_STATE,
          nextStateAt: null,
          stateTargetUserId: null,
        },
      },
    };
  });

  it("방이 존재하지 않으면 중단", async () => {
    (getRoom as jest.Mock).mockResolvedValue(null);

    await cardBbangEffect(mockRoomId, mockUserId, mockTargetId);

    expect(getRoom).toHaveBeenCalledWith(mockRoomId);
    expect(updateCharacterFromRoom).not.toHaveBeenCalled();
  });

  it("사용자 정보가 없으면 중단", async () => {
    (getRoom as jest.Mock).mockResolvedValue({});
    (getUserFromRoom as jest.Mock).mockResolvedValueOnce(null);

    await cardBbangEffect(mockRoomId, mockUserId, mockTargetId);

    expect(updateCharacterFromRoom).not.toHaveBeenCalled();
  });

  it("타깃 정보가 없으면 중단", async () => {
    (getRoom as jest.Mock).mockResolvedValue({});
    (getUserFromRoom as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(null);

    await cardBbangEffect(mockRoomId, mockUserId, mockTargetId);

    expect(updateCharacterFromRoom).not.toHaveBeenCalled();
  });

  it("타깃이 이미 사망 상태이면 중단", async () => {
    mockTarget.character.hp = 0;
    (getRoom as jest.Mock).mockResolvedValue({});
    (getUserFromRoom as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockTarget);

    await cardBbangEffect(mockRoomId, mockUserId, mockTargetId);

    expect(updateCharacterFromRoom).not.toHaveBeenCalled();
  });

  it("정상적으로 빵야 효과 처리", async () => {
    (getRoom as jest.Mock).mockResolvedValue({});
    (getUserFromRoom as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockTarget);

    await cardBbangEffect(mockRoomId, mockUserId, mockTargetId);

    expect(mockUser.character.stateInfo.state).toBe(CharacterStateType.BBANG_SHOOTER);
    expect(mockUser.character.stateInfo.stateTargetUserId).toBe(mockTargetId);

    expect(mockTarget.character.stateInfo.state).toBe(2); // BBANG_TARGET
    expect(mockTarget.character.stateInfo.stateTargetUserId).toBe(mockUserId);

    expect(updateCharacterFromRoom).toHaveBeenCalledTimes(2);
    expect(updateCharacterFromRoom).toHaveBeenCalledWith(mockRoomId, mockUserId, mockUser.character);
    expect(updateCharacterFromRoom).toHaveBeenCalledWith(mockRoomId, mockTargetId, mockTarget.character);
  });
});
