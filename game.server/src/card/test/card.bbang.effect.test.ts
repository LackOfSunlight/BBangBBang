import { CharacterStateType, RoomStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { CheckGuerrillaService } from '../../services/guerrilla.check.service';
import { getRoom, getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import cardBbangEffect from '../card.bbang.effect';

// Mock dependencies
jest.mock('../../utils/room.utils');
jest.mock('../../services/guerrilla.check.service');

// Cast mocks to the correct type
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
	let consoleLogSpy: jest.SpyInstance;
	let consoleErrorSpy: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();

		const now = Date.now();
		jest.spyOn(Date, 'now').mockReturnValue(now);

		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

		user = new User(userId, 'User');
		user.character = { hp: 4, stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE } } as any;

		target = new User(targetId, 'Target');
		target.character = { hp: 4, stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE } } as any;

		mockRoom = new Room(roomId, userId, 'Test Room', 8, RoomStateType.INGAME, [
			user,
			target,
		]);

		mockGetRoom.mockReturnValue(mockRoom);
		mockGetUserFromRoom.mockImplementation((_, id) => (id === userId ? user : target));
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		consoleErrorSpy.mockRestore();
	});

	// --- Validation Tests ---

	it('방, 유저, 타겟 정보가 없으면 false를 반환해야 한다', () => {
		mockGetRoom.mockReturnValueOnce(null);
		expect(cardBbangEffect(roomId, userId, targetId)).toBe(false);

		mockGetUserFromRoom.mockImplementationOnce(() => null);
		expect(cardBbangEffect(roomId, userId, targetId)).toBe(false);

		user.character = undefined;
		expect(cardBbangEffect(roomId, userId, targetId)).toBe(false);
	});

	it('타겟의 HP가 0 이하면 false를 반환해야 한다', () => {
		target.character!.hp = 0;
		expect(cardBbangEffect(roomId, userId, targetId)).toBe(false);
		expect(consoleLogSpy).toHaveBeenCalledWith('타깃 유저의 체력이 이미 0 입니다.');
	});

	// --- State-based Logic Tests ---

	it('일반 상태에서 빵야를 사용하면, BBANG 상태로 변경해야 한다', () => {
		const now = Date.now();
		const expectedNextStateAt = `${now + 10000}`;

		const result = cardBbangEffect(roomId, userId, targetId);

		expect(result).toBe(true);
		expect(user.character!.stateInfo!.state).toBe(CharacterStateType.BBANG_SHOOTER);
		expect(user.character!.stateInfo!.stateTargetUserId).toBe(targetId);
		expect(user.character!.stateInfo!.nextStateAt).toBe(expectedNextStateAt);

		expect(target.character!.stateInfo!.state).toBe(CharacterStateType.BBANG_TARGET);
		expect(target.character!.stateInfo!.stateTargetUserId).toBe(userId);
		expect(target.character!.stateInfo!.nextStateAt).toBe(expectedNextStateAt);

		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(2);
	});

	it('데스매치 상태에서 빵야를 사용하면, 데스매치 관련 상태로 변경해야 한다', () => {
		user.character!.stateInfo!.state = CharacterStateType.DEATH_MATCH_TURN_STATE;

		const result = cardBbangEffect(roomId, userId, targetId);

		expect(result).toBe(true);
		expect(user.character!.stateInfo!.state).toBe(CharacterStateType.DEATH_MATCH_STATE);
		expect(user.character!.stateInfo!.nextState).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);
		expect(target.character!.stateInfo!.state).toBe(CharacterStateType.DEATH_MATCH_TURN_STATE);
		expect(target.character!.stateInfo!.nextState).toBe(CharacterStateType.DEATH_MATCH_STATE);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(2);
	});

	it('게릴라 타겟 상태에서 빵야를 사용하면, 상태를 초기화하고 GuerrillaService를 호출해야 한다', () => {
		user.character!.stateInfo!.state = CharacterStateType.GUERRILLA_TARGET;

		const result = cardBbangEffect(roomId, userId, targetId);

		expect(result).toBe(true);
		expect(user.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, userId, user.character);
		expect(mockUpdateCharacterFromRoom).toHaveBeenCalledTimes(1); // Only user is updated
		expect(mockGetRoom).toHaveBeenCalledTimes(2); // Called again inside the logic
		expect(mockCheckGuerrillaService).toHaveBeenCalledWith(mockRoom);
	});

	// --- Error Handling Test ---

	it('DB 업데이트 중 에러가 발생하면 false를 반환해야 한다', () => {
		const dbError = new Error('DB connection failed');
		mockUpdateCharacterFromRoom.mockImplementation(() => {
			throw dbError;
		});

		const result = cardBbangEffect(roomId, userId, targetId);

		expect(result).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(`로그 저장에 실패하였습니다:[${dbError}]`);
	});
});