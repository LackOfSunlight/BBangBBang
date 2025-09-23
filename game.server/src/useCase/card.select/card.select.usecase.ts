import {
	CardType,
	CharacterStateType,
	GlobalFailCode,
	SelectCardType,
} from '../../generated/common/enums';
import { C2SCardSelectRequest, S2CCardSelectResponse } from '../../generated/packet/game_actions';
import { GameSocket } from '../../type/game.socket';
import { addCardToUser } from '../../managers/card.manager';

import { getRoom, getUserFromRoom } from '../../utils/room.utils';

export const cardSelectUseCase = (
	socket: GameSocket,
	req: C2SCardSelectRequest,
): S2CCardSelectResponse => {
	const { userId, roomId } = socket;
	if (!userId || !roomId) {
		return { success: false, failCode: GlobalFailCode.AUTHENTICATION_FAILED };
	}

	const room = getRoom(roomId);
	if (!room) {
		return { success: false, failCode: GlobalFailCode.ROOM_NOT_FOUND };
	}

	const user = getUserFromRoom(roomId, userId);
	if (!user || !user.character) {
		return { success: false, failCode: GlobalFailCode.CHARACTER_NOT_FOUND };
	}

	if (user.character.stateInfo!.state !== CharacterStateType.ABSORBING) {
		return { success: false, failCode: GlobalFailCode.CHARACTER_STATE_ERROR };
	}

	const targetId = user.character.stateInfo!.stateTargetUserId;
	const target = getUserFromRoom(roomId, targetId);
	if (!target || !target.character) {
		return { success: false, failCode: GlobalFailCode.CHARACTER_NOT_FOUND };
	}

	const { selectType, selectCardType } = req;
	let stolenCardType: CardType | undefined;

	if (selectType === SelectCardType.HAND) {
		const targetHand = target.character.handCards;
		const cardIndex = targetHand.findIndex((card) => card.type === selectCardType);
		if (cardIndex > -1) {
			stolenCardType = targetHand[cardIndex].type;
			if (targetHand[cardIndex].count > 1) {
				targetHand[cardIndex].count -= 1;
			} else {
				targetHand.splice(cardIndex, 1);
			}
		}
	} else if (selectType === SelectCardType.EQUIP) {
		const cardIndex = target.character.equips.findIndex((cardType) => cardType === selectCardType);
		if (cardIndex > -1) {
			stolenCardType = target.character.equips.splice(cardIndex, 1)[0];
		}
	} else if (selectType === SelectCardType.WEAPON) {
		if (target.character.weapon === selectCardType) {
			stolenCardType = target.character.weapon;
			target.character.weapon = CardType.NONE;
		}
	} else if (selectType === SelectCardType.DEBUFF) {
		const cardIndex = target.character.debuffs.findIndex((cardType) => cardType === selectCardType);
		if (cardIndex > -1) {
			stolenCardType = target.character.debuffs.splice(cardIndex, 1)[0];
		}
	}

	if (stolenCardType) {
		addCardToUser(user, stolenCardType);
	} else {
		return { success: false, failCode: GlobalFailCode.UNKNOWN_ERROR };
	}

	// Reset states
	user.character.stateInfo!.state = CharacterStateType.NONE_CHARACTER_STATE;
	user.character.stateInfo!.stateTargetUserId = '0';
	target.character.stateInfo!.state = CharacterStateType.NONE_CHARACTER_STATE;

	return { success: true, failCode: GlobalFailCode.NONE_FAILCODE };
};
