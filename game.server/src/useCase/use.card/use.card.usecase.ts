import { GamePacketType } from '../../enums/gamePacketType';
import { CardType, GlobalFailCode } from '../../generated/common/enums';
import { getRoom } from '../../utils/room.utils';
import { applyCardEffect } from '../../dispatcher/apply.card.dispacher';
import { broadcastDataToRoom } from '../../sockets/notification.js';
import { useCardNotificationPacketForm } from '../../converter/packet.form';
import { applyCardUseHandler } from '../../handlers/apply.card.use.handler';

export const useCardUseCase = (
	userId: string,
	roomId: number,
	cardType: CardType,
	targetUserId: string,
): { success: boolean; failcode: GlobalFailCode } => {
	const { room, user, target} = applyCardUseHandler(roomId, userId, targetUserId);
	if (!room) {
		return { success: false, failcode: GlobalFailCode.ROOM_NOT_FOUND };
	}

	// 카드 타입 검증
	if (cardType === CardType.NONE) {
		console.error(`[useCardHandler] 잘못된 카드 타입 요청: NONE`);
		return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
	}

	// 카드 사용 로직 처리

	// 메인 로직
	const isSuccess = applyCardEffect(roomId, cardType, userId, targetUserId!);
	if (!isSuccess) {
		console.log('사용 실패');
		return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
	}

	// useCardNotification 패킷 전달
	const useCardNotificationPacket = useCardNotificationPacketForm(cardType, userId, targetUserId);

	// 장착이 가능한가? equipCard : useCard
	if (cardType >= 13 && cardType <= 20) {
		broadcastDataToRoom(
			room.users,
			useCardNotificationPacket,
			GamePacketType.equipCardNotification,
		);
	} else
		broadcastDataToRoom(room.users, useCardNotificationPacket, GamePacketType.useCardNotification);

	// userUpdateNotification 패킷 전달

	return {
		success: true,
		failcode: GlobalFailCode.NONE_FAILCODE,
	};
};
