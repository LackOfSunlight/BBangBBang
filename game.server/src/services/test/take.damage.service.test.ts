import { AnimationType, CardType, CharacterType } from '../../generated/common/enums';
import { playAnimationHandler } from '../../handlers/play.animation.handler';
import { cardManager } from '../../managers/card.manager';
import { Room } from '../../models/room.model';
import { User } from '../../models/user.model';
import takeDamageService from '../take.damage.service';

// Mock dependencies
jest.mock('../../handlers/play.animation.handler');
jest.mock('../../managers/card.manager');

// Cast mocks to the correct type
const mockPlayAnimationHandler = playAnimationHandler as jest.Mock;

describe('takeDamageService', () => {
	let mockRoom: Room;
	let user: User;
	let shooter: User;
	const damage = 1;
	let randomMock: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();

		user = new User('user-1', 'User');
		user.character = {
			hp: 4,
			equips: [],
			handCards: [],
			handCardsCount: 0,
			characterType: CharacterType.RED,
		} as any;

		shooter = new User('shooter-1', 'Shooter');
		shooter.character = {
			hp: 4,
			handCards: [{ type: CardType.HAND_GUN, count: 1 }],
		} as any;

		mockRoom = { id: 1, users: [user, shooter] } as Room;
	});

	afterEach(() => {
		if (randomMock) randomMock.mockRestore();
	});

	// --- Defense Scenarios ---
	describe('방어 로직', () => {
		it('자동 방패로 방어에 성공해야 한다', () => {
			user.character!.equips.push(CardType.AUTO_SHIELD);
			randomMock = jest.spyOn(Math, 'random').mockReturnValue(0.1); // 10% < 25%

			takeDamageService(mockRoom, user, shooter, damage);

			expect(user.character!.hp).toBe(4); // HP should not change
			expect(mockPlayAnimationHandler).toHaveBeenCalledWith(
				mockRoom.users,
				user.id,
				AnimationType.SHIELD_ANIMATION,
			);
		});

		it('개구리 특성으로 방어에 성공해야 한다', () => {
			user.character!.characterType = CharacterType.FROGGY;
			randomMock = jest.spyOn(Math, 'random').mockReturnValue(0.2); // 20% < 25%

			takeDamageService(mockRoom, user, shooter, damage);

			expect(user.character!.hp).toBe(4);
			expect(mockPlayAnimationHandler).toHaveBeenCalled();
		});

		it('방어에 실패하면 데미지를 받아야 한다', () => {
			user.character!.equips.push(CardType.AUTO_SHIELD);
			randomMock = jest.spyOn(Math, 'random').mockReturnValue(0.5); // 50% > 25%

			takeDamageService(mockRoom, user, shooter, damage);

			expect(user.character!.hp).toBe(3);
			expect(mockPlayAnimationHandler).not.toHaveBeenCalled();
		});
	});

	// --- Damage Scenarios by Character Type ---
	describe('캐릭터별 데미지 처리', () => {
		beforeEach(() => {
			// Ensure defense always fails for these tests
			randomMock = jest.spyOn(Math, 'random').mockReturnValue(0.9);
		});

		it('일반 캐릭터는 데미지만 받는다', () => {
			takeDamageService(mockRoom, user, shooter, damage);
			expect(user.character!.hp).toBe(3);
		});

		it('말랑이는 데미지를 받고 카드 1장을 뽑는다', () => {
			user.character!.characterType = CharacterType.MALANG;
			(cardManager.drawDeck as jest.Mock).mockReturnValue([CardType.SHIELD]);

			takeDamageService(mockRoom, user, shooter, damage);

			expect(user.character!.hp).toBe(3);
			expect(cardManager.drawDeck).toHaveBeenCalledWith(mockRoom.id, 1);
			expect(user.character!.handCards).toContainEqual({ type: CardType.SHIELD, count: 1 });
			expect(user.character!.handCardsCount).toBe(1);
		});

		it('핑크슬라임은 데미지를 받고 상대 카드를 1장 훔친다', () => {
			user.character!.characterType = CharacterType.PINK_SLIME;
			// Mock random to steal the first card
			randomMock.mockReturnValue(0);

			takeDamageService(mockRoom, user, shooter, damage);

			expect(user.character!.hp).toBe(3);
			// Shooter loses the card
			expect(shooter.character!.handCards.length).toBe(0);
			// User gains the card
			expect(user.character!.handCards).toContainEqual({ type: CardType.HAND_GUN, count: 1 });
		});

		it('핑크슬라임이 훔칠 카드가 없으면, 데미지만 받는다', () => {
			user.character!.characterType = CharacterType.PINK_SLIME;
			shooter.character!.handCards = []; // Shooter has no cards

			takeDamageService(mockRoom, user, shooter, damage);

			expect(user.character!.hp).toBe(3);
			// No card transfer should happen
			expect(user.character!.handCards.length).toBe(0);
		});
	});
});
