import { GameSocket } from "../type/game.socket.js";
import { GamePacket } from "../generated/gamePacket.js";
import { GamePacketType } from "../enums/gamePacketType.js";
import { getGamePacketType } from "../utils/type.converter.js";
import { gamePackTypeSelect } from "../enums/gamePacketType.js";

import { sendData } from "../utils/send.data.js";
import { broadcastDataToRoom } from "../utils/notification.util.js";

import { GlobalFailCode } from "../generated/common/enums.js";
import { CardType } from "../generated/common/enums.js";
import { User } from "../models/user.model.js";
import { Room } from "../models/room.model.js";

import { getRoom } from "../utils/room.utils.js";

import { useCardUseCase }  from "../useCase/use.card/use.card.usecase.js";


const useCardHandler = async (socket: GameSocket, gamePacket: GamePacket) => {
	/// 1. DTO 생성 및 기본 유효성 검사
	const { userId, roomId } = socket;
	if (!userId || !roomId) {
		// DTO가 유효하지 않으면 즉시 에러 응답
		is_invalid_request(socket);
		return;
	}
 
    const room: Room | null = await getRoom(roomId);
    if (!room) {
        is_invalid_request(socket);
        return;
    }


    const payload = getGamePacketType(gamePacket, gamePackTypeSelect.useCardRequest);
    if (!payload) {
        is_invalid_request(socket);
        return;
    }

    const req = payload.useCardRequest;
    const cardType = req.cardType;
    const targetUserId = req.targetUserId;
    //let isUseCard: boolean = true;

    // 카드 타입 검증
    if (req.cardType === CardType.NONE) {
        console.warn(`[useCardRequestHandler] 잘못된 카드 타입 요청: NONE`);
        is_invalid_request(socket);
        return;
    }



	/// 2. 유즈케이스 호출
	const { useCardResponse, useCardNotification, userUpdateNotification } = await useCardUseCase( {userId, roomId, cardType, targetUserId} );



	/// 3. 유즈케이스 결과에 따라 응답/알림 전송
	const useCardResponsePacket = createUseCardResponsePacket(useCardResponse.success, useCardResponse.GlobalFailCode);
	sendData(socket, useCardResponsePacket, GamePacketType.useCardResponse);

	if (useCardNotification && useCardNotification.targetUserId) {
        const useCardNotificationPacket = createUseCardNotificationPacket(useCardNotification.cardType, useCardNotification.userId, useCardNotification.targetUserId);

        // 장착이 가능한가? equipCard : useCard
        if(useCardNotification.cardType >= 13 && useCardNotification.cardType <= 20) broadcastDataToRoom(room.users, useCardNotificationPacket, GamePacketType.equipCardNotification);
		else broadcastDataToRoom(room.users, useCardNotificationPacket, GamePacketType.useCardNotification);
        
	}

    if (userUpdateNotification){
        const userUpdateNotificationPacket = createUserUpdateNotificationPacket(userUpdateNotification.user);
		broadcastDataToRoom(room.users, userUpdateNotificationPacket, GamePacketType.userUpdateNotification);
    }

};


/** 오류코드:잘못된요청을 일괄 처리하기 위한 함수 */
const is_invalid_request = (socket: GameSocket) => {
    const wrongDTO = createUseCardResponsePacket(false, GlobalFailCode.INVALID_REQUEST);
	sendData(socket, wrongDTO, GamePacketType.useCardResponse);
}


/** 패킷 세팅 */

export const createUseCardResponsePacket = (success: boolean, failCode: GlobalFailCode): GamePacket => {
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

export default useCardHandler;
