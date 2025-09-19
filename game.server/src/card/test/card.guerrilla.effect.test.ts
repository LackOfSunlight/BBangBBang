import { CardType, CharacterStateType } from '../../generated/common/enums';
import { drawSpecificCard } from '../../managers/card.manager';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { getRoom, getUserFromRoom, saveRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import cardGuerrillaEffect from '../card.guerrilla.effect';
import { RoomStateType } from '../../generated/common/enums';

// Mock dependencies
jest.mock('../../utils/room.utils');
jest.mock('../../managers/card.manager');

// Cast mocks to the correct type
const mockGetRoom = getRoom as jest.Mock;
const mockGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockSaveRoom = saveRoom as jest.Mock;
const mockUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;
const mockDrawSpecificCard = drawSpecificCard as jest.Mock;

describe('cardGuerrillaEffect', () => {
	let mockRoom: Room;
	let shooter: User;
	let otherUser1: User;
	let otherUser2: User;
	const roomId = 1;
	const shooterId = '1';
	const targetId = '2';

	beforeEach(() => {
		// Clear all mocks before each test
		jest.clearAllMocks();

		// Mock Date.now() for predictable timestamps
		const now = Date.now();
		jest.spyOn(Date, 'now').mockReturnValue(now);

		// Setup default user and room data
		shooter = new User(shooterId, 'Shooter');
		shooter.character = {
			hp: 4,
			handCards: [],
			stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
		} as any;

		otherUser1 = new User('2', 'Other1');
		otherUser1.character = {
			hp: 4,
			handCards: [],
			stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
		} as any;

		otherUser2 = new User('3', 'Other2');
		otherUser2.character = {
			hp: 4,
			handCards: [],
			stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
		} as any;

		mockRoom = new Room(roomId, shooterId, 'Test Room', 7, RoomStateType.INGAME, [
			shooter,
			otherUser1,
			otherUser2,
		]);

		// Default mock implementations
		mockGetRoom.mockReturnValue(mockRoom);
		mockGetUserFromRoom.mockReturnValue(shooter);
	});

	// --- Validation and Edge Case Tests ---

	it('방을 찾을 수 없으면 false를 반환해야 한다', () => {
		mockGetRoom.mockReturnValue(null);
		const result = cardGuerrillaEffect(roomId, shooterId, targetId);
		expect(result).toBe(false);
		expect(mockSaveRoom).not.toHaveBeenCalled();
	});

	it('슈터를 찾을 수 없으면 false를 반환해야 한다', () => {
		mockGetUserFromRoom.mockReturnValue(null);
		const result = cardGuerrillaEffect(roomId, shooterId, targetId);
		expect(result).toBe(false);
		expect(mockSaveRoom).not.toHaveBeenCalled();
	});

	// --- Blocked Scenario Tests ---

	describe('다른 유저가 특수 상태일 때 (사용 불가 조건)', () => {
		beforeEach(() => {
			// Set another user to a blocking state
			otherUser1.character!.stateInfo!.state = CharacterStateType.DEATH_MATCH_STATE;
		});

		it('카드를 되돌려받고 true를 반환해야 한다', () => {
			mockDrawSpecificCard.mockReturnValue(CardType.GUERRILLA);

			const result = cardGuerrillaEffect(roomId, shooterId, targetId);

			expect(result).toBe(true);
			expect(mockDrawSpecificCard).toHaveBeenCalledWith(roomId, CardType.GUERRILLA);
			expect(mockUpdateCharacterFromRoom).toHaveBeenCalledWith(roomId, shooterId, shooter.character);
			// The card should be added back to the shooter's hand
			expect(shooter.character!.handCards).toContainEqual({ type: CardType.GUERRILLA, count: 1 });
			// Main logic should not run
			expect(mockSaveRoom).not.toHaveBeenCalled();
		});

		it('되돌려받을 카드가 덱에 없으면, 메인 로직이 실행되어야 한다 (버그성 동작 확인)', () => {
			// This test case verifies a potential bug where failure to draw a card
			// causes the main effect to trigger despite the blocking condition.
			mockDrawSpecificCard.mockReturnValue(undefined);

			const result = cardGuerrillaEffect(roomId, shooterId, targetId);

			expect(result).toBe(true);
			expect(mockDrawSpecificCard).toHaveBeenCalledWith(roomId, CardType.GUERRILLA);
			expect(mockUpdateCharacterFromRoom).not.toHaveBeenCalled(); // Card not returned, so no update
			expect(mockSaveRoom).toHaveBeenCalledWith(mockRoom); // Main logic runs
			expect(shooter.character!.stateInfo!.state).toBe(CharacterStateType.GUERRILLA_SHOOTER);
		});
	});

	// --- Success Scenario Tests ---

	describe('모든 유저가 일반 상태일 때 (사용 성공 조건)', () => {
		it('모든 유저의 상태를 게릴라 상태로 변경하고 true를 반환해야 한다', () => {
			const now = Date.now();
			const expectedNextStateAt = `${now + 10000}`;

			const result = cardGuerrillaEffect(roomId, shooterId, targetId);

			expect(result).toBe(true);
			expect(mockSaveRoom).toHaveBeenCalledWith(mockRoom);
			expect(mockDrawSpecificCard).not.toHaveBeenCalled(); // Should not be called in success case

			// Verify shooter's state
			const shooterState = shooter.character!.stateInfo!;
			expect(shooterState.state).toBe(CharacterStateType.GUERRILLA_SHOOTER);
			expect(shooterState.nextState).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(shooterState.nextStateAt).toBe(expectedNextStateAt);
			expect(shooterState.stateTargetUserId).toBe(targetId);

			// Verify otherUser1's state
			const other1State = otherUser1.character!.stateInfo!;
			expect(other1State.state).toBe(CharacterStateType.GUERRILLA_TARGET);
			expect(other1State.nextState).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(other1State.nextStateAt).toBe(expectedNextStateAt);
			expect(other1State.stateTargetUserId).toBe(shooterId);

			// Verify otherUser2's state
			const other2State = otherUser2.character!.stateInfo!;
			expect(other2State.state).toBe(CharacterStateType.GUERRILLA_TARGET);
			expect(other2State.nextState).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(other2State.nextStateAt).toBe(expectedNextStateAt);
			expect(other2State.stateTargetUserId).toBe(shooterId);
		});

		it('HP가 0인 유저는 타겟으로 지정되지 않아야 한다', () => {
			otherUser2.character!.hp = 0;

			cardGuerrillaEffect(roomId, shooterId, targetId);

			// Target1 should be a target
			expect(otherUser1.character!.stateInfo!.state).toBe(CharacterStateType.GUERRILLA_TARGET);

			// Target2 (0 HP) should not be a target
			expect(otherUser2.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(mockSaveRoom).toHaveBeenCalled();
		});
	});
});
