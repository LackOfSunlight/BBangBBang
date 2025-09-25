import { GamePacket } from '../../generated/gamePacket';
import { C2SDestroyCardRequest } from '../../generated/packet/game_actions';
import { GameSocket } from '../../type/game.socket';
import { getUserFromRoom, updateCharacterFromRoom } from '../../utils/room.utils';
import { destroyResponseForm } from '../../converter/packet.form';

const destroyCardUseCase = async (
	socket: GameSocket,
	req: C2SDestroyCardRequest,
): Promise<GamePacket> => {
	const user = getUserFromRoom(socket.roomId!, socket.userId!);

	if (user && user.character) {
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

		updateCharacterFromRoom(socket.roomId!, user.id, user.character);

		return destroyResponseForm(user.character.handCards);
	} else {
		return destroyResponseForm([]);
	}
};



export default destroyCardUseCase;
