import { CardType, CharacterStateType, RoomStateType } from '../../generated/common/enums';
import { cardManager } from '../../managers/card.manager';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import {
	getRoom,
	getUserFromRoom,
	saveRoom,
	updateCharacterFromRoom,
} from '../../utils/room.utils';
import cardBigBbangEffect from '../active/card.bigbbang.effect';

// Mock dependencies
jest.mock('../../utils/room.utils');
jest.mock('../../managers/card.manager');

// Cast mocks to the correct type
const mockGetRoom = getRoom as jest.Mock;
const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockSaveRoom = saveRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;

describe('cardBigBbangEffect', () => {
	let mockRoom: Room;
	let shooter: User;
	let target1: User;
	let target2: User; // This user will have 0 HP in one test
	const roomId = 1;
	const shooterId = '1';
	const aimedTargetId = '2'; // The specific user aimed at

	beforeEach(() => {
		jest.clearAllMocks();

		const now = Date.now();
		jest.spyOn(Date, 'now').mockReturnValue(now);

		shooter = new User(shooterId, 'Shooter');
		shooter.character = {
			hp: 4,
			handCards: [],
			stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
		} as any;

		target1 = new User(aimedTargetId, 'Target1');
		target1.character = {
			hp: 4,
			handCards: [],
			stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
		} as any;

		target2 = new User('3', 'Target2');
		target2.character = {
			hp: 4,
			handCards: [],
			stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
		} as any;

		mockRoom = new Room(roomId, shooterId, 'Test Room', 8, RoomStateType.INGAME, [
			shooter,
			target1,
			target2,
		]);

		mockGetRoom.mockReturnValue(mockRoom);
		mockGetUserFromRoom.mockReturnValue(shooter);
	});

	// --- Validation Tests ---

	it('방 또는 슈터를 찾을 수 없으면 false를 반환해야 한다', () => {
		mockGetRoom.mockReturnValue(null);
		expect(cardBigBbangEffect(roomId, shooterId, aimedTargetId)).toBe(false);

		mockGetRoom.mockReturnValue(mockRoom);
		mockGetUserFromRoom.mockReturnValue(null);
		expect(cardBigBbangEffect(roomId, shooterId, aimedTargetId)).toBe(false);
	});

	// --- Blocked Scenario Tests ---

	describe('다른 유저가 특수 상태일 때', () => {
		beforeEach(() => {
			target1.character!.stateInfo!.state = CharacterStateType.DEATH_MATCH_STATE;
		});

		it('카드를 되돌려받고 false를 반환해야 한다', () => {
			const result = cardBigBbangEffect(roomId, shooterId, aimedTargetId);

			expect(result).toBe(false);
			expect(cardManager.drawSpecificCard).not.toHaveBeenCalled();
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled();
			expect(mockSaveRoom).not.toHaveBeenCalled();
		});
	});

	// --- Success Scenario Tests ---

	describe('모든 유저가 일반 상태일 때', () => {
		it('슈터와 HP가 0보다 큰 모든 타겟의 상태를 변경해야 한다', () => {
			const now = Date.now();
			const expectedNextStateAt = `${now + 10}`;

			const result = cardBigBbangEffect(roomId, shooterId, aimedTargetId);

			expect(result).toBe(true);
			expect(mockSaveRoom).toHaveBeenCalledWith(mockRoom);
			expect(cardManager.drawSpecificCard).not.toHaveBeenCalled();

			// Verify shooter's state
			const shooterState = shooter.character!.stateInfo!;
			expect(shooterState.state).toBe(CharacterStateType.BIG_BBANG_SHOOTER);
			expect(shooterState.nextStateAt).toBe(expectedNextStateAt);
			expect(shooterState.stateTargetUserId).toBe(aimedTargetId);

			// Verify target1's state
			const target1State = target1.character!.stateInfo!;
			expect(target1State.state).toBe(CharacterStateType.BIG_BBANG_TARGET);
			expect(target1State.nextStateAt).toBe(expectedNextStateAt);
			expect(target1State.stateTargetUserId).toBe(shooterId);

			// Verify target2's state
			const target2State = target2.character!.stateInfo!;
			expect(target2State.state).toBe(CharacterStateType.BIG_BBANG_TARGET);
			expect(target2State.nextStateAt).toBe(expectedNextStateAt);
			expect(target2State.stateTargetUserId).toBe(shooterId);
		});

		it('HP가 0인 유저는 타겟으로 지정되지 않아야 한다', () => {
			target2.character!.hp = 0;

			cardBigBbangEffect(roomId, shooterId, aimedTargetId);

			// Target1 should be a target
			expect(target1.character!.stateInfo!.state).toBe(CharacterStateType.BIG_BBANG_TARGET);

			// Target2 (0 HP) should not be a target
			expect(target2.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(mockSaveRoom).toHaveBeenCalled();
		});
	});
});
