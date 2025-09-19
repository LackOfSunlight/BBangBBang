import { CardType, CharacterStateType, CharacterType, RoomStateType } from '../../generated/common/enums';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import { CheckBigBbangService } from '../../services/bigbbang.check.service';
import { getRoom, saveRoom } from '../../utils/room.utils';
import cardShieldEffect from '../card.shield.effect';

// Mock dependencies
jest.mock('../../utils/room.utils');
jest.mock('../../services/bigbbang.check.service');

// Cast mocks to the correct type
const mockGetRoom = getRoom as jest.Mock;
const mockSaveRoom = saveRoom as jest.Mock;
const mockCheckBigBbangService = CheckBigBbangService as jest.Mock;

describe('cardShieldEffect', () => {
	let mockRoom: Room;
	let user: User; // The user using the shield
	let shooter: User;
	const roomId = 1;
	const userId = '1';
	const shooterId = '2';

	beforeEach(() => {
		jest.clearAllMocks();

		// Setup default user and room data
		user = new User(userId, 'ShieldUser');
		user.character = {
			hp: 4,
			equips: [],
			handCards: [{ type: CardType.SHIELD, count: 5 }],
			stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
		} as any;

		shooter = new User(shooterId, 'Shooter');
		shooter.character = {
			hp: 4,
			equips: [],
			handCards: [],
			bbangCount: 0,
			stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
		} as any;

		mockRoom = new Room(roomId, shooterId, 'Test Room', 8, RoomStateType.INGAME, [
			user,
			shooter,
		]);

		// Default mock implementations
		mockGetRoom.mockReturnValue(mockRoom);
		// Mock service to return the room it was given
		mockCheckBigBbangService.mockImplementation((room) => room);
	});

	// --- Validation Tests ---

	it('방을 찾을 수 없으면 false를 반환해야 한다', () => {
		mockGetRoom.mockReturnValue(null);
		const result = cardShieldEffect(roomId, userId, '');
		expect(result).toBe(false);
	});

	it('사용자나 캐릭터 정보가 없으면 false를 반환해야 한다', () => {
		user.character = undefined;
		const result = cardShieldEffect(roomId, userId, '');
		expect(result).toBe(false);
	});

	// --- Main Logic Tests ---

	it('BBANG_TARGET 상태가 아닐 때, 자신의 상태만 초기화해야 한다', () => {
		user.character!.stateInfo!.state = CharacterStateType.GUERRILLA_TARGET; // Any state other than BBANG_TARGET

		const result = cardShieldEffect(roomId, userId, '');

		expect(result).toBe(true);
		expect(user.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
		expect(mockCheckBigBbangService).toHaveBeenCalledWith(mockRoom);
		expect(mockSaveRoom).toHaveBeenCalledWith(mockRoom);
	});

	describe('유저가 BBANG_TARGET 상태일 때', () => {
		beforeEach(() => {
			user.character!.stateInfo = {
				state: CharacterStateType.BBANG_TARGET,
				stateTargetUserId: shooterId,
			} as any;
		});

		it('일반 슈터의 공격을 방어해야 한다', () => {
			cardShieldEffect(roomId, userId, '');

			// No shields should be removed
			expect(user.character!.handCards.find((c) => c.type === CardType.SHIELD)?.count).toBe(5);
			expect(user.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(shooter.character!.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			expect(shooter.character!.bbangCount).toBe(1);
			expect(mockSaveRoom).toHaveBeenCalled();
		});

		it('샤크 슈터의 공격을 방어하고 방패 1개를 소모해야 한다', () => {
			shooter.character!.characterType = CharacterType.SHARK;

			cardShieldEffect(roomId, userId, '');

			expect(user.character!.handCards.find((c) => c.type === CardType.SHIELD)?.count).toBe(4);
			expect(shooter.character!.bbangCount).toBe(1);
		});

		it('레이저 포인터 슈터의 공격을 방어하고 방패 1개를 소모해야 한다', () => {
			shooter.character!.equips.push(CardType.LASER_POINTER);

			cardShieldEffect(roomId, userId, '');

			expect(user.character!.handCards.find((c) => c.type === CardType.SHIELD)?.count).toBe(4);
			expect(shooter.character!.bbangCount).toBe(1);
		});

		it('샤크+레이저 포인터 슈터의 공격을 방어하고 방패 3개를 소모해야 한다', () => {
			shooter.character!.characterType = CharacterType.SHARK;
			shooter.character!.equips.push(CardType.LASER_POINTER);

			cardShieldEffect(roomId, userId, '');

			expect(user.character!.handCards.find((c) => c.type === CardType.SHIELD)?.count).toBe(2);
			expect(shooter.character!.bbangCount).toBe(1);
		});

		it('가진 방패보다 더 많은 방패가 필요할 때, 모든 방패를 소모해야 한다', () => {
			shooter.character!.characterType = CharacterType.SHARK;
			shooter.character!.equips.push(CardType.LASER_POINTER);
			user.character!.handCards = [{ type: CardType.SHIELD, count: 2 }]; // User has only 2 shields

			cardShieldEffect(roomId, userId, '');

			// All shields should be removed
			expect(user.character!.handCards.find((c) => c.type === CardType.SHIELD)).toBeUndefined();
			expect(shooter.character!.bbangCount).toBe(1);
		});
	});
});
