import { CharacterStateType, RoomStateType, CardType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { CheckGuerrillaService } from '../../services/guerrilla.check.service';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { cardManager } from '../../managers/card.manager';
import cardBbangEffect from '../active/card.bbang.effect';

// Mock dependencies
jest.mock('../../utils/room.utils');
jest.mock('../../services/guerrilla.check.service');
jest.mock('../../managers/card.manager');

// Cast mocks to correct types
const mockGetRoom = getRoom as jest.Mock;
const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;
const mockCheckGuerrillaService = CheckGuerrillaService as jest.Mock;

describe('cardBbangEffect', () => {
  let mockRoom: Room;
  let user: User;
  let target: User;
  const roomId = 1;
  const userId = 'user-1';
  const targetId = 'target-1';
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    user = new User(userId, 'User');
    user.character = {
      hp: 4,
      stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
      handCards: [{ type: CardType.BBANG, count: 1 }],
    } as any;

    target = new User(targetId, 'Target');
    target.character = {
      hp: 4,
      stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
    } as any;

    mockRoom = new Room(roomId, userId, 'Test Room', 8, RoomStateType.INGAME, [user, target]);

    mockGetRoom.mockReturnValue(mockRoom);
    mockGetUserFromRoom.mockImplementation((_, id) => (id === userId ? user : target));
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // --- Validation Tests ---

  it('방이 없으면 false 반환', () => {
    mockGetRoom.mockReturnValueOnce(null);
    expect(cardBbangEffect(roomId, userId, targetId)).toBe(false);
  });

  it('유저 정보가 없으면 false 반환', () => {
    mockGetUserFromRoom.mockImplementationOnce(() => null);
    expect(cardBbangEffect(roomId, userId, targetId)).toBe(false);
  });

  it('타겟 HP가 0 이하면 false 반환', () => {
    target.character!.hp = 0;
	const ishp0 = cardBbangEffect(roomId, userId, targetId);
    expect(ishp0).toBe(false);
  });

  // --- State-based Logic Tests ---

  it('일반 상태에서 빵야를 사용하면 BBANG 상태로 변경', () => {
    const now = Date.now();
    const expectedNextStateAt = `${now + 10}`;

    const result = cardBbangEffect(roomId, userId, targetId);

    expect(result).toBe(true);
    expect(user.character!.stateInfo!.state).toBe(CharacterStateType.BBANG_SHOOTER);
    expect(target.character!.stateInfo!.state).toBe(CharacterStateType.BBANG_TARGET);
    expect(user.character!.stateInfo!.nextStateAt).toBe(expectedNextStateAt);
    expect(target.character!.stateInfo!.nextStateAt).toBe(expectedNextStateAt);
    expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(2);
    expect(cardManager.removeCard).toHaveBeenCalledWith(user, mockRoom, CardType.BBANG);
  });

  it('데스매치 턴 상태에서 빵야를 사용하면 데스매치 관련 상태로 변경', () => {
    user.character!.stateInfo!.state = CharacterStateType.DEATH_MATCH_TURN_STATE;

    const result = cardBbangEffect(roomId, userId, targetId);

    expect(result).toBe(true);
    expect(user.character!.stateInfo!.state).toBe(CharacterStateType.DEATH_MATCH_STATE);
    expect(target.character!.stateInfo!.state).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);
    expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(2);
    expect(cardManager.removeCard).toHaveBeenCalledWith(user, mockRoom, CardType.BBANG);
  });

  it('게릴라 타겟 상태에서 빵야를 사용하면 상태 초기화 & GuerrillaService 호출', () => {
    user.character!.stateInfo!.state = CharacterStateType.GUERRILLA_TARGET;

    const result = cardBbangEffect(roomId, userId, targetId);

    expect(result).toBe(true);
    expect(user.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
    expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, user.character);
    expect(mockCheckGuerrillaService).toHaveBeenCalledWith(mockRoom);
    expect(cardManager.removeCard).toHaveBeenCalledWith(user, mockRoom, CardType.BBANG);
  });

  // --- Error Handling Test ---

  it('DB 업데이트 실패하면 false 반환', () => {
    const dbError = new Error('DB connection failed');
    mockUpdateCharacterFromRoom.mockImplementation(() => {
      throw dbError;
    });

    const result = cardBbangEffect(roomId, userId, targetId);

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[BBANG]로그 저장에 실패하였습니다:[${dbError}]`);
  });
});
