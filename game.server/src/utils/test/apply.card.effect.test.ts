// apply.card.effect.test.ts
import { applyCardEffect } from '../apply.card.effect';
import { getUserFromRoom } from '../redis.util';
import cardBbangEffect from '../../card/card.bbang.effect';

// redis.util 모듈의 필요 함수들을 mock 처리
jest.mock('../redis.util', () => ({
	getUserFromRoom: jest.fn(),
}));
jest.mock('../../card/card.bbang.effect');

describe('applyCardEffect', () => {
	const roomId = 1;
	const userId = 'user1';
	const targetUserId = 'user2';

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('유저 또는 타겟이 존재하지 않으면 아무 동작 안함', async () => {
		(getUserFromRoom as jest.Mock).mockResolvedValueOnce(null);

		await applyCardEffect(roomId, 1, userId, targetUserId);

		expect(cardBbangEffect).not.toHaveBeenCalled();
	});

	it('유저에게 캐릭터가 없다면 아무 동작 안함', async () => {
		(getUserFromRoom as jest.Mock)
			.mockResolvedValueOnce({ id: userId }) // user without character
			.mockResolvedValueOnce({ id: targetUserId, character: {} });

		await applyCardEffect(roomId, 1, userId, targetUserId);

		expect(cardBbangEffect).not.toHaveBeenCalled();
	});

	it('유저에게 남은 카드가 없다면 아무 동작 안함', async () => {
		(getUserFromRoom as jest.Mock)
			.mockResolvedValueOnce({
				id: userId,
				character: { handCards: [{ type: 99 }] },
			})
			.mockResolvedValueOnce({
				id: targetUserId,
				character: { handCards: [] },
			});

		await applyCardEffect(roomId, 1, userId, targetUserId);

		expect(cardBbangEffect).not.toHaveBeenCalled();
	});

	it('BBang 카드 사용 명령어가 들어오면, 소지 카드중 해당 카드와 일치하는 맨 앞의 카드를 제거후 CardBbangEffect 실행', async () => {
		const handCards = [{ type: 1 }, { type: 99 }];
		const user = { id: userId, character: { handCards } };
		const target = { id: targetUserId, character: { handCards: [] } };

		(getUserFromRoom as jest.Mock).mockResolvedValueOnce(user).mockResolvedValueOnce(target);

		await applyCardEffect(roomId, 1, userId, targetUserId);

		expect(user.character.handCards).toEqual([{ type: 99 }]); // 카드 제거됨
		expect(cardBbangEffect).toHaveBeenCalledWith(roomId, userId, targetUserId); // CardBbangEffect 명령 수행
	});

	it('잘못된 카드 정보가 들어오면 에러 메시지 반환', async () => {
		const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const handCards = [{ type: 123 }];
		const user = { id: userId, character: { handCards: [...handCards] } };
		const target = { id: targetUserId, character: { handCards: [] } };

		(getUserFromRoom as jest.Mock).mockResolvedValueOnce(user).mockResolvedValueOnce(target);

		await applyCardEffect(roomId, 123, userId, targetUserId);

		expect(consoleSpy).toHaveBeenCalledWith('Unknown card type');
		consoleSpy.mockRestore();
	});
});
