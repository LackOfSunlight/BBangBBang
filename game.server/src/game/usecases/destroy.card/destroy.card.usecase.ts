import { GamePacket } from '@core/generated/gamePacket';
import { C2SDestroyCardRequest } from '@core/generated/packet/game_actions';
import { GameSocket } from '@common/types/game.socket';
import { destroyResponseForm } from '@common/converters/packet.form';
import roomManger from '@game/managers/room.manager';

const destroyCardUseCase = async (
	socket: GameSocket,
	req: C2SDestroyCardRequest,
): Promise<GamePacket> => {
	try {
		const user = roomManger.getUserFromRoom(socket.roomId!, socket.userId!);

		if (!user || !user.character) return destroyResponseForm([]);

		for (const destroyCard of req.destroyCards) {
			const idx = user.character.handCards.findIndex((c) => c.type === destroyCard.type);

			if (idx !== -1) {
				const card = user.character.handCards[idx];

				card.count -= destroyCard.count;

				if (card.count <= 0) {
					user.character.handCards.splice(idx, 1);
				}
			}
		}

		user.character.handCardsCount = user.character.handCards.reduce(
			(sum, card) => sum + card.count,
			0,
		);

		return destroyResponseForm(user.character.handCards);

	} catch (error) {
		
		return destroyResponseForm([]);
	}
};

export default destroyCardUseCase;
