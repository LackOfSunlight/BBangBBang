import { GamePacketType } from '@game/enums/gamePacketType';
import {
	CardType,
	CharacterStateType,
	GlobalFailCode,
	SelectCardType,
} from '@core/generated/common/enums';
import { C2SCardSelectRequest } from '@core/generated/packet/game_actions';
import { GameSocket } from '@common/types/game.socket';
import { broadcastDataToRoom } from '@core/network/sockets/notification';
import {
	cardSelectResponseForm,
	userUpdateNotificationPacketForm,
} from '@common/converters/packet.form';
import { GamePacket } from '@core/generated/gamePacket';
import roomManger from '@game/managers/room.manager';

const DEFAULT_TARGET_USER_ID = '0';

export const cardSelectUseCase = (socket: GameSocket, req: C2SCardSelectRequest): GamePacket => {
	const { userId, roomId } = socket;
	if (!userId || !roomId) {
		return cardSelectResponseForm(false, GlobalFailCode.AUTHENTICATION_FAILED);
	}

	const room = roomManger.getRoom(roomId);
	if (!room) {
		return cardSelectResponseForm(false, GlobalFailCode.ROOM_NOT_FOUND);
	}

	const user = roomManger.getUserFromRoom(roomId, userId);
	if (!user || !user.character) {
		return cardSelectResponseForm(false, GlobalFailCode.CHARACTER_NOT_FOUND);
	}

	if (
		user.character.stateInfo!.state !== CharacterStateType.ABSORBING &&
		user.character.stateInfo!.state !== CharacterStateType.HALLUCINATING
	) {
		return cardSelectResponseForm(false, GlobalFailCode.CHARACTER_STATE_ERROR);
	}

	const targetId = user.character.stateInfo!.stateTargetUserId;
	const target = roomManger.getUserFromRoom(roomId, targetId);
	if (!target || !target.character) {
		return cardSelectResponseForm(false, GlobalFailCode.CHARACTER_NOT_FOUND);
	}

	const { selectType, selectCardType } = req;
	let stolenCardType: CardType | undefined;

	switch (selectType) {
		case SelectCardType.HAND: {
			const targetHand = target.character.handCards;
			const randomIndex = Math.floor(Math.random() * targetHand.length);
			const targetCard = targetHand[randomIndex];
			if (targetCard) {
				stolenCardType = targetCard.type;

				target.character.removeHandCard(stolenCardType);
			}
			break;
		}
		case SelectCardType.EQUIP: {
			const cardIndex = target.character.equips.findIndex(
				(cardType) => cardType === selectCardType,
			);
			if (cardIndex > -1) {
				stolenCardType = target.character.equips.splice(cardIndex, 1)[0];
			}
			break;
		}
		case SelectCardType.WEAPON: {
			if (target.character.weapon === selectCardType) {
				stolenCardType = target.character.weapon;
				target.character.weapon = 0;
			}
			break;
		}
		case SelectCardType.DEBUFF: {
			const cardIndex = target.character.debuffs.findIndex(
				(cardType) => cardType === selectCardType,
			);
			if (cardIndex > -1) {
				stolenCardType = target.character.debuffs.splice(cardIndex, 1)[0];
			}
			break;
		}
	}

	if (stolenCardType) {
		if (user.character.stateInfo!.state === CharacterStateType.ABSORBING) {
			user.character.addCardToUser(stolenCardType);
		} else if (user.character.stateInfo.state === CharacterStateType.HALLUCINATING) {
			room.repeatDeck([stolenCardType]);
		}

		user.character.changeState();

		target.character.changeState();
	} else {
		return cardSelectResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
	}

	const toRoom = room.toData();

	const userUpdateNotificationPacket = userUpdateNotificationPacketForm(toRoom.users);
	broadcastDataToRoom(
		toRoom.users,
		userUpdateNotificationPacket,
		GamePacketType.userUpdateNotification,
	);

	return cardSelectResponseForm(true, GlobalFailCode.NONE_FAILCODE);
};
