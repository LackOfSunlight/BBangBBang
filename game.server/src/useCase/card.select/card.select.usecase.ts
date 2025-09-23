import { GamePacketType } from '../../enums/gamePacketType';
import {
	CardType,
	CharacterStateType,
	GlobalFailCode,
	SelectCardType,
} from '../../generated/common/enums';
import { GamePacket } from '../../generated/gamePacket';
import { C2SCardSelectRequest, S2CCardSelectResponse } from '../../generated/packet/game_actions';
import { User } from '../../models/user.model';
import { GameSocket } from '../../type/game.socket';
import { addCardToUser } from '../../managers/card.manager';
import { broadcastDataToRoom } from '../../utils/notification.util';
import { getRoom, getUserFromRoom } from '../../utils/room.utils';
import { userUpdateNotificationPacketForm } from '../../factory/packet.pactory';

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

	if (user.character.stateInfo!.state !== CharacterStateType.ABSORBING && 
		user.character.stateInfo!.state !== CharacterStateType.HALLUCINATING) {
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
		const randomIndex = Math.floor(Math.random()*targetHand.length);
		const targetCard = targetHand[randomIndex];
		if (targetCard) {
			// 찾은 카드 타입 저장
			stolenCardType = targetCard.type;
			if (targetCard.count > 1) {
				// 여러 장 있으면 개수만 줄임
				targetCard.count -= 1;
			} else {
				// 1장뿐이면 배열에서 제거
				const index = targetHand.indexOf(targetCard);
				targetHand.splice(index, 1);
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
			target.character.weapon = 0;
		}
	} else if (selectType === SelectCardType.DEBUFF) {
		const cardIndex = target.character.debuffs.findIndex((cardType) => cardType === selectCardType);
		if (cardIndex > -1) {
			stolenCardType = target.character.debuffs.splice(cardIndex, 1)[0];
		}
	}

	if (stolenCardType) {
		// 흡수 카드인 경우: 카드를 가져오기
		if (user.character.stateInfo!.state === CharacterStateType.ABSORBING) {
			addCardToUser(user, stolenCardType);
		}
		// 신기루 카드인 경우: 카드 삭제만 (가져오지 않음)
		// stolenCardType은 이미 타겟에서 제거됨
	} else {
		return { success: false, failCode: GlobalFailCode.UNKNOWN_ERROR };
	}

	// Reset states
	user.character.stateInfo!.state = CharacterStateType.NONE_CHARACTER_STATE;
	user.character.stateInfo!.stateTargetUserId = '0';
	target.character.stateInfo!.state = CharacterStateType.NONE_CHARACTER_STATE;

	const userUpdateNotificationPacket = userUpdateNotificationPacketForm(room.users);
	broadcastDataToRoom(
		room.users,
		userUpdateNotificationPacket,
		GamePacketType.userUpdateNotification,
	);


	return { success: true, failCode: GlobalFailCode.NONE_FAILCODE };
};

