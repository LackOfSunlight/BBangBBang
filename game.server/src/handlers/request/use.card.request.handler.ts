import { GameSocket } from '../../type/game.socket.js';
//import { C2SUseCardRequest } from "../../generated/packet/game_actions.js";
import { GamePacket } from '../../generated/gamePacket.js';
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';

import useCardResponseHandler from '../response/use.card.response.handler.js';
import useCardNotificationHandler from '../notification/use.card.notification.handler.js';
import equipCardNotificationHandler from '../notification/equip.card.notification.handler.js';
import userUpdateNotificationHandler from '../notification/user.update.notification.handler.js';

import { CardType, GlobalFailCode } from '../../generated/common/enums.js';

import { applyCardEffect } from '../../utils/apply.card.effect.js';
import { User } from '../../models/user.model';
import { getRoom, getUserInfoFromRoom } from '../../utils/redis.util.js';

const useCardRequestHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	const payload = getGamePacketType(gamePacket, gamePackTypeSelect.useCardRequest);
	if (!payload) return;

	const req = payload.useCardRequest;

	// 카드 타입 검증
	if (req.cardType === CardType.NONE) {
		console.warn(`[useCardRequestHandler] 잘못된 카드 타입 요청: NONE`);
		return setUseCardResponse(false, GlobalFailCode.INVALID_REQUEST);
	}

	//try{
	console.log(
		`[useCardRequestHandler] 유저 ${socket.userId} 가 ${req.targetUserId} 를 대상으로 ${CardType[req.cardType]} 카드를 사용하려 합니다)`,
	);

	// 필요값들 유효성 체크
	if (!socket.roomId || !socket.userId || !req.targetUserId) return;

	// 카드 효과 적용
	await applyCardEffect(socket.roomId, req.cardType, socket.userId, req.targetUserId);
	// 카드 효과 적용 후 유저 정보 가져오기
	const room = await getRoom(socket.roomId);
	if (!room) return;

	// response : 카드 사용 성공
	await useCardResponseHandler(socket, setUseCardResponse(true, GlobalFailCode.NONE_FAILCODE));

	// notification : 카드 사용 공지
	if (req.cardType >= 13 && req.cardType <= 20)
		// 무기 및 장비 카드 사용시 -> 장착
		await equipCardNotificationHandler(
			socket,
			// setEquipCardNotification( req.cardType, socket.userId! )
			setUseCardNotification(req.cardType, socket.userId!, req.targetUserId),
		); // 일반 카드 사용시 -> 효과 발동
	else
		await useCardNotificationHandler(
			socket,
			setUseCardNotification(req.cardType, socket.userId!, req.targetUserId),
		);

	// notification : 유저 관련 정보 변동 공지
	await userUpdateNotificationHandler(socket, setUserUpdateNotification(room.users));
	//}catch (error) {}
};

/** 패킷 세팅 */

export const setUseCardResponse = (success: boolean, failCode: GlobalFailCode): GamePacket => {
	const ResponsePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.useCardResponse,
			useCardResponse: {
				success: success,
				failCode: failCode,
			},
		},
	};

	return ResponsePacket;
};

export const setUseCardNotification = (
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
				targetUserId: targetUserId !== '0' ? targetUserId:"0",
			},
		},
	};

	return NotificationPacket;
};

export const setUserUpdateNotification = (user: User[]): GamePacket => {
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

export default useCardRequestHandler;
