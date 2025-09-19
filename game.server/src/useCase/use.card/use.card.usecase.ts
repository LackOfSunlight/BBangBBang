import { GamePacket } from '../../generated/gamePacket';
import { GamePacketType } from '../../enums/gamePacketType';
import { CardType, GlobalFailCode } from '../../generated/common/enums';
import { User } from '../../models/user.model';

import { getRoom } from '../../utils/room.utils';

import { applyCardEffect } from '../../utils/apply.card.effect';
import { broadcastDataToRoom } from '../../utils/notification.util.js';

export const useCardUseCase = async (userId:string, roomId:number, cardType:CardType, targetUserId:string): Promise<{success:boolean, failcode:GlobalFailCode}> => {

	const room = getRoom(roomId);
	if (!room) {
		return { success: false, failcode: GlobalFailCode.ROOM_NOT_FOUND };
	}

	// 카드 타입 검증
	if (cardType === CardType.NONE) {
		console.error(`[useCardHandler] 잘못된 카드 타입 요청: NONE`);
		return {  success: false, failcode: GlobalFailCode.INVALID_REQUEST  };
	}

	console.log(
		`[useCardHandler] 유저 ${userId} 가 ${targetUserId} 를 대상으로 ${CardType[cardType]} 카드를 사용하려 합니다)`,
	);

	await applyCardEffect(roomId, cardType, userId, targetUserId!);

	// useCardNotification 패킷 전달
	const useCardNotificationPacket = createUseCardNotificationPacket(
		cardType,
		userId,
		targetUserId,
	);

	// 장착이 가능한가? equipCard : useCard
	if (cardType >= 13 && cardType <= 20)
		broadcastDataToRoom(
			room.users,
			useCardNotificationPacket,
			GamePacketType.equipCardNotification,
		);
	else
		broadcastDataToRoom(
			room.users,
			useCardNotificationPacket,
			GamePacketType.useCardNotification,
		);
	

	// userUpdateNotification 패킷 전달
	const userUpdateNotificationPacket = createUserUpdateNotificationPacket(
		room.users,
	);
	broadcastDataToRoom(
		room.users,
		userUpdateNotificationPacket,
		GamePacketType.userUpdateNotification,
	);


	return {
		success: true, failcode: GlobalFailCode.NONE_FAILCODE,
	};
};

export const createUseCardNotificationPacket = (
	cardType: CardType,
	userId: string,
	targetUserId: string,
): GamePacket => {
	const NotificationPacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.useCardNotification,
			useCardNotification: {
				cardType: cardType,
				userId: userId,
				targetUserId: targetUserId !== '0' ? targetUserId : '0',
			},
		},
	};

	return NotificationPacket;
};

export const createUserUpdateNotificationPacket = (user: User[]): GamePacket => {
	const NotificationPacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.userUpdateNotification,
			userUpdateNotification: {
				user: user,
			},
		},
	};

	return NotificationPacket;
};