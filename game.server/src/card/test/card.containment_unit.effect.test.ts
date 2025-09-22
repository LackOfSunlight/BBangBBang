import cardContainmentUnitEffect, {
  checkContainmentUnitTarget,
  debuffContainmentUnitEffect,
} from '../debuff/card.containment_unit.effect';
import { CardType, CharacterStateType } from '../../generated/common/enums.js';
import { getUserFromRoom, updateCharacterFromRoom, getRoom } from '../../utils/room.utils';

jest.mock('../../utils/room.utils', () => ({
	getRoom: jest.fn(),
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn()
}));

const mockedGetUserFromRoom = jest.mocked(getUserFromRoom);
const mockedUpdateCharacterFromRoom = jest.mocked(updateCharacterFromRoom);
const mockedGetRoom = jest.mocked(getRoom);

describe('cardContainmentUnitEffect', () => {
  const roomId = 1;
  const userId = 'shooter1';
  const targetUserId = 'target1';

  const makeCharacter = (overrides = {}) => ({
    debuffs: [],
    stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('시전자나 대상이 없으면 false 반환', () => {
    mockedGetUserFromRoom.mockReturnValueOnce(null as any);
    const result = cardContainmentUnitEffect(roomId, userId, targetUserId);
    expect(result).toBe(false);
  });


  it('대상이 이미 디버프 상태라면 false 반환', () => {
    mockedGetUserFromRoom
      .mockReturnValueOnce({ id: userId, character: makeCharacter() } as any)
      .mockReturnValueOnce({
        id: targetUserId,
        nickname: 'Target',
        character: makeCharacter({ debuffs: [CardType.CONTAINMENT_UNIT] }),
      } as any);

    const result = cardContainmentUnitEffect(roomId, userId, targetUserId);
    expect(result).toBe(false);
  });


  it('성공적으로 디버프가 적용되는지 ', () => {
    const targetChar = makeCharacter();
    mockedGetUserFromRoom
      .mockReturnValueOnce({ id: userId, character: makeCharacter() } as any)
      .mockReturnValueOnce({
        id: targetUserId,
        nickname: 'Target',
        character: targetChar,
      } as any);

    mockedUpdateCharacterFromRoom.mockImplementation(() => true as any);

    const result = cardContainmentUnitEffect(roomId, userId, targetUserId);
    expect(result).toBe(true);
    expect(targetChar.debuffs).toContain(CardType.CONTAINMENT_UNIT);
    expect(mockedUpdateCharacterFromRoom).toHaveBeenCalledWith(
      roomId,
      targetUserId,
      expect.objectContaining({ debuffs: [CardType.CONTAINMENT_UNIT] }),
    );
  });
});




describe('checkContainmentUnitTarget', () => {
  const roomId = 1;

  it('방 정보가 없으면 방참조실패 에러 반환', () => {
    mockedGetRoom.mockReturnValueOnce(null as any);
    const result = checkContainmentUnitTarget(roomId);
    expect(result).toBeNull();
  });


  it('디버프를 가지고 있는 유저라면 debuffContainmentUnitEffect 함수 호출 ', () => {
    const user = {
      id: 'user1',
      character: {
        debuffs: [CardType.CONTAINMENT_UNIT],
        stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
      },
    };
    mockedGetRoom.mockReturnValue({
      users: [user],
    } as any);

    const spy = jest.spyOn(require('../../card/card.containment_unit.effect'), 'debuffContainmentUnitEffect'); // 실행하지 않고 통과했는지만 확인
    checkContainmentUnitTarget(roomId);
    expect(spy).toHaveBeenCalledWith(roomId, 'user1');
  });
});



describe('debuffContainmentUnitEffect', () => {
  const roomId = 1;
  const userId = 'target1';

  const makeUser = (state: CharacterStateType, debuffs = [CardType.CONTAINMENT_UNIT]) => ({
    id: userId,
    nickname: 'Target',
    character: {
      debuffs,
      stateInfo: { state }, // 상태에 따라 값이 변동하므로 상태값만 대입할 수 있도록 설정
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('첫 사이클에서 감금 카드가 디버프 카드란에 있다면 CONTAINED 상태로 변경', () => {
    const user = makeUser(CharacterStateType.NONE_CHARACTER_STATE);
    mockedGetUserFromRoom.mockReturnValueOnce(user as any);
    debuffContainmentUnitEffect(roomId, userId);
    expect(user.character.stateInfo.state).toBe(CharacterStateType.CONTAINED);
    expect(mockedUpdateCharacterFromRoom).toHaveBeenCalled();
  });


  it('이미 CONTAINED 상태인 유저는 탈출로직을 실행', () => {
    const user = makeUser(CharacterStateType.CONTAINED);
    mockedGetUserFromRoom.mockReturnValueOnce(user as any);
    // 강제로 탈출 성공하도록 Math.random 고정
    jest.spyOn(global.Math, 'random').mockReturnValue(0.01);

    debuffContainmentUnitEffect(roomId, userId);
    expect(user.character.debuffs).not.toContain(CardType.CONTAINMENT_UNIT);
    expect(user.character.stateInfo.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);

    (global.Math.random as jest.Mock).mockRestore();
  });
});
