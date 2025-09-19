// card.containment_unit.effect.test.ts
import cardContainmentUnitEffect, {
	debuffContainmentUnitEffect,
} from '../card.containment_unit.effect';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils.js';
import { CardType, CharacterStateType } from '../../generated/common/enums.js';

jest.mock('../../utils/room.utils.js', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));

// 전체 모듈
describe('CardContainmentUnitCardEffects', () => {
	const mockUser = (overrides = {}) => ({
		id: 'user1',
		character: {
			debuffs: [],
			stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
			...overrides,
		},
	});

	beforeEach(() => {
		jest.clearAllMocks();
});

// 카드 효과 처리 로직
describe('cardContainmentUnitEffect', () => {
	it('대상 유저에게 디버프가 적용되는지', async () => {
		const user = mockUser();
		const target = mockUser();

		(getUserFromRoom as jest.Mock)
			.mockResolvedValueOnce(user) // 시전자
			.mockResolvedValueOnce(target); // 대상자

		cardContainmentUnitEffect(1, 'user1', 'user2');

		expect(getUserFromRoom).toHaveBeenCalledWith(1, 'user1');
		expect(getUserFromRoom).toHaveBeenCalledWith(1, 'user2');
		expect(updateCharacterFromRoom).toHaveBeenCalledWith(
			1,
			'user2',
			expect.objectContaining({
				debuffs: [CardType.CONTAINMENT_UNIT], // 디버프 란에 감금 카드 추가
			}),
		);
	});

	it('시전 유저나 대상 유저 정보가 올바르지 않으면 중단되는지', async () => {
		(getUserFromRoom as jest.Mock).mockResolvedValueOnce(null);

		cardContainmentUnitEffect(1, 'user1', 'user2');

		expect(updateCharacterFromRoom).not.toHaveBeenCalled();
	});

	it('대상 유저가 이미 디버프 상태라면 시전이 중단되는지', async () => {
		const target = mockUser({
			debuffs: [CardType.CONTAINMENT_UNIT],
		});

		(getUserFromRoom as jest.Mock).mockResolvedValue(target);

		cardContainmentUnitEffect(1, 'user1', 'user2');

		expect(updateCharacterFromRoom).not.toHaveBeenCalled();
	});
});

	// 디버프 효과 처리 로직
	describe('debuffContainmentUnitEffect', () => {
		it('디버프가 존재하고 대상 유저의 상태가 NONE_CHARACTER_STATE 라면, 대상 유저의 상태가 CONTAINED 로 설정되는지', async () => {
			const target = mockUser({
				debuffs: [CardType.CONTAINMENT_UNIT],
				stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE },
			});

			(getUserFromRoom as jest.Mock).mockResolvedValue(target);

			debuffContainmentUnitEffect(1, 'user1');

			expect(updateCharacterFromRoom).toHaveBeenCalledWith(
				1,
				'user1',
				expect.objectContaining({
					stateInfo: { state: CharacterStateType.CONTAINED }, // 디버프 받고 바로 다음 날
				}),
			);
		});

		it('탈출에 성공하면 디버프가 해제되는지', async () => {
			jest.spyOn(global.Math, 'random').mockReturnValue(0.1); // 10% < 25% → 탈출 성공
			const target = mockUser({
				debuffs: [CardType.CONTAINMENT_UNIT],
				stateInfo: { state: CharacterStateType.CONTAINED },
			});

			(getUserFromRoom as jest.Mock).mockResolvedValue(target);

			debuffContainmentUnitEffect(1, 'user1');

			expect(target.character.debuffs).not.toContain(CardType.CONTAINMENT_UNIT);
			expect(target.character.stateInfo!.state).toBe(CharacterStateType.NONE_CHARACTER_STATE);
			// escape 시 updateCharacterFromRoom 호출 안 하는 부분도 체크 가능
			expect(updateCharacterFromRoom).toHaveBeenCalledWith(
				1,
				'user1',
				expect.objectContaining({
					stateInfo: { state: CharacterStateType.NONE_CHARACTER_STATE }, // 디버프 해제
				}),
			);

			jest.spyOn(global.Math, 'random').mockRestore();
		});

		it('탈출에 실패하면 디버프가 유지되는지', async () => {
			jest.spyOn(global.Math, 'random').mockReturnValue(0.9); // 90% > 25% → 탈출 실패
			const target = mockUser({
				debuffs: [CardType.CONTAINMENT_UNIT],
				stateInfo: { state: CharacterStateType.CONTAINED },
			});

			(getUserFromRoom as jest.Mock).mockResolvedValue(target);

			debuffContainmentUnitEffect(1, 'user1');

			expect(target.character.debuffs).toContain(CardType.CONTAINMENT_UNIT);
			expect(target.character.stateInfo!.state).toBe(CharacterStateType.CONTAINED);
			expect(updateCharacterFromRoom).toHaveBeenCalled();

			jest.spyOn(global.Math, 'random').mockRestore();
		});

		it('대상 유저가 없다면 아무 일도 발생하지 않는지', async () => {
			(getUserFromRoom as jest.Mock).mockResolvedValue(null);

			debuffContainmentUnitEffect(1, 'user1');

			expect(updateCharacterFromRoom).not.toHaveBeenCalled();
		});
	});
});
