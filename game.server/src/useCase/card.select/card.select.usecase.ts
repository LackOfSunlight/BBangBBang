import { GamePacketType } from '../../enums/gamePacketType';
import {
	CardType,
	CharacterStateType,
	GlobalFailCode,
	SelectCardType,
} from '../../generated/common/enums';
import { C2SCardSelectRequest } from '../../generated/packet/game_actions';
import { GameSocket } from '../../type/game.socket';
import { broadcastDataToRoom } from '../../sockets/notification';
import {
	cardSelectResponseForm,
	userUpdateNotificationPacketForm,
} from '../../converter/packet.form';
import { GamePacket } from '../../generated/gamePacket';
import { cardManager } from '../../managers/card.manager';
import roomManger from '../../managers/room.manger';

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
				if (targetCard.count > 1) {
					targetCard.count -= 1;
				} else {
					const index = targetHand.indexOf(targetCard);
					targetHand.splice(index, 1);
				}
			}
			break;
		}
		case SelectCardType.EQUIP: {
			const cardIndex = target.character.equips.findIndex((cardType) => cardType === selectCardType);
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
			const cardIndex = target.character.debuffs.findIndex((cardType) => cardType === selectCardType);
			if (cardIndex > -1) {
				stolenCardType = target.character.debuffs.splice(cardIndex, 1)[0];
			}
			break;
		}
	}

	if (stolenCardType) {
		// 흡수 카드인 경우: 카드를 가져오기
		if (user.character.stateInfo!.state === CharacterStateType.ABSORBING) {
			cardManager.addCardToUser(user, stolenCardType);
		}
		// 신기루 카드인 경우: 카드 삭제만 (가져오지 않음)
		// stolenCardType은 이미 타겟에서 제거됨
	} else {
		return cardSelectResponseForm(false, GlobalFailCode.UNKNOWN_ERROR);
	}

	// Reset states
	user.character.stateInfo!.state = CharacterStateType.NONE_CHARACTER_STATE;
	user.character.stateInfo!.stateTargetUserId = DEFAULT_TARGET_USER_ID;
	target.character.stateInfo!.state = CharacterStateType.NONE_CHARACTER_STATE;

	const userUpdateNotificationPacket = userUpdateNotificationPacketForm(room.users);
	broadcastDataToRoom(
		room.users,
		userUpdateNotificationPacket,
		GamePacketType.userUpdateNotification,
	);

	return cardSelectResponseForm(true, GlobalFailCode.NONE_FAILCODE);
};
