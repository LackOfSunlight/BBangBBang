import { GamePacketType } from '@game/enums/gamePacketType';
import { CardType, GlobalFailCode } from '@core/generated/common/enums';
import { applyCardEffect } from '@core/network/dispatcher/apply.card.dispacher';
import { broadcastDataToRoom } from '@core/network/sockets/notification.js';
import {
	fleaMarketNotificationForm,
	useCardNotificationPacketForm,
} from '@common/converters/packet.form';
import { applyCardUseHandler } from '@game/handlers/apply.card.use.handler';

export const useCardUseCase = (
	userId: string,
	roomId: number,
	cardType: CardType,
	targetUserId: string,
): { success: boolean; failcode: GlobalFailCode } => {
	const { room, user, target } = applyCardUseHandler(roomId, userId, targetUserId);
	if (!room && !user && !target) {
		return { success: false, failcode: GlobalFailCode.ROOM_NOT_FOUND };
	}

	// 카드 타입 검증
	if (cardType === CardType.NONE) {
		console.error(`[useCardHandler] 잘못된 카드 타입 요청: NONE`);
		return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
	}

	// 카드 사용 로직 처리

	// 메인 로직
	const isSuccess = applyCardEffect(room, cardType, user, target);
	if (!isSuccess) {
		console.log('사용 실패');
		return { success: false, failcode: GlobalFailCode.INVALID_REQUEST };
	}

	const toRoom = room.toData();

	// useCardNotification 패킷 전달
	const useCardNotificationPacket = useCardNotificationPacketForm(cardType, userId, targetUserId);

	if (cardType === CardType.FLEA_MARKET) {
		const selectedCards = room.roomFleaMarketCards;

		if (selectedCards !== undefined) {
			const gamePacket = fleaMarketNotificationForm(selectedCards, []);
			broadcastDataToRoom(toRoom.users, gamePacket, GamePacketType.fleaMarketNotification);
		}
	}

	// 장착이 가능한가? equipCard : useCard
	if (cardType >= 13 && cardType <= 20) {
		broadcastDataToRoom(
			toRoom.users,
			useCardNotificationPacket,
			GamePacketType.equipCardNotification,
		);
	} else
		broadcastDataToRoom(
			toRoom.users,
			useCardNotificationPacket,
			GamePacketType.useCardNotification,
		);

	// userUpdateNotification 패킷 전달

	return {
		success: true,
		failcode: GlobalFailCode.NONE_FAILCODE,
	};
};
