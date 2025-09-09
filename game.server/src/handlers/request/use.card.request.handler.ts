import { GameSocket } from "../../type/game.socket.js";
//import { C2SUseCardRequest } from "../../generated/packet/game_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';

import useCardResponseHandler from '../response/use.card.response.handler.js';
import useCardNotificationHandler from "../notification/use.card.notification.handler.js";
import userUpdateNotificationHandler from "../notification/user.update.notification.handler.js";

import { CardType, GlobalFailCode } from "../../generated/common/enums.js";

import { applyCardEffect } from "../../utils/applyCardEffect.js";
import { User } from "../../models/user.model";
import { getUserInfoFromRoom } from "../../utils/redis.util.js";
 

const useCardRequestHandler = async (socket:GameSocket, gamePacket:GamePacket) => {

    const payload = getGamePacketType(
    gamePacket,
    gamePackTypeSelect.useCardRequest
    );
    if (!payload) return;

    const req = payload.useCardRequest;

    // 카드 타입 검증
    if (req.cardType === CardType.NONE) {
        console.warn(`[useCardRequestHandler] 잘못된 카드 타입 요청: NONE`);
        return setUseCardResponse(false, GlobalFailCode.INVALID_REQUEST);
    }

    //try{
    console.log(
        `[useCardRequestHandler] 유저 ${socket.userId} 가 ${req.targetUserId} 를 대상으로 ${CardType[req.cardType]} 카드를 사용하려 합니다)`
    );

    // 필요값들 유효성 체크
    if(!socket.roomId || !socket.userId || !req.targetUserId) return; 
    
    // 카드 효과 적용
    applyCardEffect(socket.roomId, req.cardType, socket.userId, req.targetUserId);
    // 카드 효과 적용 후 유저 정보 가져오기
    const userData = await getUserInfoFromRoom(socket.roomId, socket.userId);

    // 카드 사용 고지
    await useCardResponseHandler(socket, 
        setUseCardResponse(true, GlobalFailCode.NONE_FAILCODE)
    );
    await useCardNotificationHandler(socket,
        setUseCardNotification(req.cardType, socket.userId!, req.targetUserId),
    );
    await userUpdateNotificationHandler(socket,  
       setUserUpdateNotification( userData ) 
    );
    //}catch (error) {}
};



export const setUseCardResponse = (
    success: boolean,
    failCode: GlobalFailCode
) : GamePacket => {
    const ResponsePacket: GamePacket = {
        payload: {
            oneofKind: GamePacketType.useCardResponse,
            useCardResponse: {
                success: success,
                failCode: failCode
            }
        }
    }

    return ResponsePacket;
};

export const setUseCardNotification = (
    cardType: CardType,
    userId: string,
    targetUserId: string
) : GamePacket => {
    const NotificationPacket: GamePacket = {
        payload: {
            oneofKind: GamePacketType.useCardNotification,
            useCardNotification: {
                cardType: cardType,
                userId: userId,
                targetUserId: targetUserId
            }
        }
    }

    return NotificationPacket;
};

export const setUserUpdateNotification = (
    user: User[]
) : GamePacket => {
    const NotificationPacket: GamePacket = {
        payload: {
            oneofKind: GamePacketType.userUpdateNotification,
            userUpdateNotification: {
                user: user
            }
        }
    }

    return NotificationPacket;
};

export default  useCardRequestHandler;
