import { applyCardEffect } from '../../dispatcher/apply.card.dispacher';
import { getUserFromRoom, updateCharacterFromRoom } from '../room.utils';
import { cardManager } from '../../managers/card.manager.js';

// 카드 효과 모듈 mock
import cardAbsorbEffect from '../../card/active/card.absorb.effect.js';
import cardAutoRifleEffect from '../../card/weapon/card.auto_rifle.effect.js';
import cardAutoShieldEffect from '../../card/equip/card.auto_shield.effect.js';
import cardBbangEffect from '../../card/active/card.bbang.effect.js';
import cardBigBbangEffect from '../../card/active/card.bigbbang.effect.js';
import cardBombEffect from '../../card/debuff/card.bomb.effect.js';
import cardCall119Effect from '../../card/active/card.call_119.effect.js';
import cardContainmentUnitEffect from '../../card/debuff/card.containment_unit.effect.js';
import cardDeathMatchEffect from '../../card/active/card.death_match.effect.js';
import cardDesertEagleEffect from '../../card/weapon/card.desert_eagle.effect.js';
import cardFleaMarketEffect from '../../card/active/card.flea_market.effect.js';
import cardGuerrillaEffect from '../../card/active/card.guerrilla.effect.js';
import cardHallucinationEffect from '../../card/active/card.hallucination.effect.js';
import cardHandGunEffect from '../../card/weapon/card.hand_gun.effect.js';
import cardLaserPointerEffect from '../../card/equip/card.laser_pointer.effect.js';
import cardMaturedSavingsEffect from '../../card/active/card.matured_savings.effect.js';
import cardRaderEffect from '../../card/equip/card.rader.effect.js';
import cardSatelliteTargetEffect from '../../card/debuff/card.satellite_target.effect.js';
import cardShieldEffect from '../../card/active/card.shield.effect.js';
import cardSniperGunEffect from '../../card/weapon/card.sniper_gun.effect.js';
import cardStealthSuitEffect from '../../card/equip/card.stealth_suit.effect.js';
import cardVaccineEffect from '../../card/active/card.vaccine.effect.js';
import cardWinLotteryEffect from '../../card/active/card.win_lottery.effect.js';

jest.mock('../room.utils', () => ({
	getUserFromRoom: jest.fn(),
	updateCharacterFromRoom: jest.fn(),
}));
jest.mock('../../managers/card.manager.js');

// 모든 카드 효과 모듈을 default export jest.fn() 으로 mock 처리
jest.mock('../../card/active/card.absorb.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/weapon/card.auto_rifle.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/equip/card.auto_shield.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/active/card.bbang.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/active/card.bigbbang.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/debuff/card.bomb.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/active/card.call_119.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/debuff/card.containment_unit.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/active/card.death_match.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/weapon/card.desert_eagle.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/active/card.flea_market.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/active/card.guerrilla.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/active/card.hallucination.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/weapon/card.hand_gun.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/equip/card.laser_pointer.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/active/card.matured_savings.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/equip/card.rader.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/debuff/card.satellite_target.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/active/card.shield.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/weapon/card.sniper_gun.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/equip/card.stealth_suit.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/active/card.vaccine.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../card/active/card.win_lottery.effect.js', () => ({
	__esModule: true,
	default: jest.fn(),
}));

const mockedGetUserFromRoom = getUserFromRoom as jest.Mock;
const mockedUpdateCharacterFromRoom = updateCharacterFromRoom as jest.Mock;

describe('applyCardEffect', () => {
	const roomId = 1;
	const userId = 'user1';
	const targetUserId = 'user2';

	beforeEach(() => {
		jest.clearAllMocks();
	});

	function mockUserWithCard(cardType: number, count = 1) {
		mockedGetUserFromRoom.mockReturnValue({
			id: userId,
			character: {
				handCards: [{ type: cardType, count }],
				handCardsCount: count,
			},
		});
	}

	test('유저 정보가 없다면 false 반환', async () => {
		mockedGetUserFromRoom.mockReturnValue(null);
		const result = await applyCardEffect(roomId, 1, userId, targetUserId);
		expect(result).toBe(false);
	});

	test('캐릭터 정보가 없다면 false 반환', async () => {
		mockedGetUserFromRoom.mockReturnValue({ id: userId });
		const result = await applyCardEffect(roomId, 1, userId, targetUserId);
		expect(result).toBe(false);
	});

	test('성공시 사용 카드를 소지 카드에서 감소 및 캐릭터 정보 업데이트', async () => {
		mockUserWithCard(1, 2); // BBANG
		(cardBbangEffect as jest.Mock).mockResolvedValue(true);

		const result = await applyCardEffect(roomId, 1, userId, targetUserId);

		expect(cardManager.repeatDeck).toHaveBeenCalledWith(roomId, [1]);
		expect(mockedUpdateCharacterFromRoom).toHaveBeenCalled();
		expect(cardBbangEffect).toHaveBeenCalledWith(roomId, userId, targetUserId);
		expect(result).toBe(true);
	});

	test('소지 카드에서 카드 카운트가 0이 된 카드 소지카드에서 제거', async () => {
		mockUserWithCard(1, 1);
		(cardBbangEffect as jest.Mock).mockResolvedValue(true);

		await applyCardEffect(roomId, 1, userId, targetUserId);

		const updatedCharacter = mockedUpdateCharacterFromRoom.mock.calls[0][2];
		expect(updatedCharacter.handCards).toEqual([]);
		expect(updatedCharacter.handCardsCount).toBe(0);
	});

	test('소지 카드 목록에 사용하려는 카드가 없다면 로그 출력 및 false 반환 ', async () => {
		mockUserWithCard(2, 1); // only BIGBBANG
		console.log = jest.fn();

		const result = await applyCardEffect(roomId, 99, userId, targetUserId);

		expect(console.log).toHaveBeenCalledWith('해당 카드를 소유하고 있지 않습니다.');
		expect(result).toBe(false);
	});

	// 카드 효과별 공통 테스트
	const cardEffectMap: Record<number, jest.MockedFunction<any>> = {
		1: cardBbangEffect as jest.Mock,
		2: cardBigBbangEffect as jest.Mock,
		3: cardShieldEffect as jest.Mock,
		4: cardVaccineEffect as jest.Mock,
		5: cardCall119Effect as jest.Mock,
		6: cardDeathMatchEffect as jest.Mock,
		7: cardGuerrillaEffect as jest.Mock,
		8: cardAbsorbEffect as jest.Mock,
		9: cardHallucinationEffect as jest.Mock,
		10: cardFleaMarketEffect as jest.Mock,
		11: cardMaturedSavingsEffect as jest.Mock,
		12: cardWinLotteryEffect as jest.Mock,
		13: cardSniperGunEffect as jest.Mock,
		14: cardHandGunEffect as jest.Mock,
		15: cardDesertEagleEffect as jest.Mock,
		16: cardAutoRifleEffect as jest.Mock,
		17: cardLaserPointerEffect as jest.Mock,
		18: cardRaderEffect as jest.Mock,
		19: cardAutoShieldEffect as jest.Mock,
		20: cardStealthSuitEffect as jest.Mock,
		21: cardContainmentUnitEffect as jest.Mock,
		22: cardSatelliteTargetEffect as jest.Mock,
		23: cardBombEffect as jest.Mock,
	};

	Object.entries(cardEffectMap).forEach(([cardType, effectFn]) => {
		test(`cardType이 ${cardType}인 카드 효과 처리 로직이 정상적으로 작동하는지 확인`, async () => {
			mockUserWithCard(Number(cardType), 1);
			effectFn.mockResolvedValue(true);

			const result = await applyCardEffect(roomId, Number(cardType), userId, targetUserId);

			expect(effectFn).toHaveBeenCalled();
			expect(result).toBe(true);
		});
	});

	test('card type이 unknown인 카드를 받으면 false 반환 ', async () => {
		mockUserWithCard(999, 1);
		console.log = jest.fn();

		const result = await applyCardEffect(roomId, 999, userId, targetUserId);

		expect(console.log).toHaveBeenCalledWith('Unknown card type');
		expect(result).toBe(false);
	});
});
