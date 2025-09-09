import { GameSocket } from "../../type/game.socket.js";
//import { C2SUseCardRequest } from "../../generated/packet/game_actions.js";
import { GamePacket } from "../../generated/gamePacket.js";
import { getGamePacketType } from '../../utils/type.converter.js';
import { GamePacketType, gamePackTypeSelect } from '../../enums/gamePacketType.js';
import useCardResponseHandler from '../response/use.card.response.handler.js';
import { CardType, GlobalFailCode } from "../../generated/common/enums.js";
import useCardNotificationHandler from "../notification/use.card.notification.handler.js";
import { getRoom } from "../../utils/redis.util.js";
import { applyCardEffect } from "../../utils/card.effect.js";
 

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
    
    const  roomId = socket.roomId;

    //try{
    console.log(
        `[useCardRequestHandler] 유저 ${socket.userId} 가 ${req.targetUserId} 를 대상으로 ${CardType[req.cardType]} 카드를 사용하려 합니다)`
    );

    const roomData = await getRoom(roomId!);

    // 카드 사용 로직
    //const effectResult = applyCardEffect(userMap, socket.userId!, req.targetUserId);

    // 카드 사용 고지
    await useCardResponseHandler(socket, 
        setUseCardResponse(true, GlobalFailCode.NONE_FAILCODE)
    );
    await useCardNotificationHandler(socket,
        setUseCardNotification(req.cardType, socket.userId!, req.targetUserId),
        roomData!
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

export default  useCardRequestHandler;
