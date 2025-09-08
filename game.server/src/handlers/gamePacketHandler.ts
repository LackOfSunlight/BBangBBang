// game.server/src/handlers/gamePacketHandler.ts
import { Socket } from "net";
import { GamePacket } from "../generated/gamePacket.js";
import { GamePacketType, gamePackTypeSelect } from "../enums/gamePacketType.js";

// Request Handlers
import registerRequestHandler from "./request/register.request.handler.js";
import loginRequestHandler from "./request/login.request.handler.js";
import createRoomRequestHandler from "./request/create.room.request.handler.js";
import getRoomListRequestHandler from "./request/get.room.list.request.handler.js";
import joinRoomRequestHandler from "./request/join.room.request.handler.js";
import joinRandomRoomRequestHandler from "./request/join.random.room.request.handler.js";
import leaveRoomRequestHandler from "./request/leave.room.request.handler.js";
import gamePrepareRequestHandler from "./request/game.prepare.request.handler.js";
import gameStartRequestHandler from "./request/game.start.request.handler.js";
import positionUpdateRequestHandler from "./request/position.update.request.handler.js";
import useCardRequestHandler from "./request/use.card.request.handler.js";
import fleaMarketPickRequestHandler from "./request/flea.market.pick.request.handler.js";
import reactionRequestHandler from "./request/reaction.request.handler.js";
import destroyCardRequestHandler from "./request/destroy.card.request.handler.js";
import cardSelectRequestHandler from "./request/card.select.request.handler.js";
import passDebuffRequestHandler from "./request/pass.debuff.request.handler.js";

// Response Handlers
import registerResponseHandler from "./response/register.response.handler.js";
import loginResponseHandler from "./response/login.response.handler.js";
import createRoomResponseHandler from "./response/create.room.response.handler.js";
import getRoomListResponseHandler from "./response/get.room.list.response.handler.js";
import joinRoomResponseHandler from "./response/join.room.response.handler.js";
import joinRandomRoomResponseHandler from "./response/join.random.room.response.handler.js";
import leaveRoomResponseHandler from "./response/leave.room.response.handler.js";
import gamePrepareResponseHandler from "./response/game.prepare.response.handler.js";
import gameStartResponseHandler from "./response/game.start.response.handler.js";
import useCardResponseHandler from "./response/use.card.response.handler.js";
import fleaMarketPickResponseHandler from "./response/flea.market.pick.response.handler.js";
import reactionResponseHandler from "./response/reaction.response.handler.js";
import destroyCardResponseHandler from "./response/destroy.card.response.handler.js";
import cardSelectResponseHandler from "./response/card.select.response.handler.js";
import passDebuffResponseHandler from "./response/pass.debuff.response.handler.js";

// Notification Handlers
import joinRoomNotificationHandler from "./notification/join.room.notification.handler.js";
import leaveRoomNotificationHandler from "./notification/leave.room.notification.handler.js";
import gamePrepareNotificationHandler from "./notification/game.prepare.notification.handler.js";
import gameStartNotificationHandler from "./notification/game.start.notification.handler.js";
import positionUpdateNotificationHandler from "./notification/position.update.notification.handler.js";
import useCardNotificationHandler from "./notification/use.card.notification.handler.js";
import equipCardNotificationHandler from "./notification/equip.card.notification.handler.js";
import cardEffectNotificationHandler from "./notification/card.effect.notification.handler.js";
import fleaMarketNotificationHandler from "./notification/flea.market.notification.handler.js";
import userUpdateNotificationHandler from "./notification/user.update.notification.handler.js";
import phaseUpdateNotificationHandler from "./notification/phase.update.notification.handler.js";
import gameEndNotificationHandler from "./notification/game.end.notification.handler.js";
import warningNotificationHandler from "./notification/warning.notification.handler.js";
import animationNotificationHandler from "./notification/animation.notification.handler.js";

const handlers = {
    // Requests
    [GamePacketType.registerRequest]: registerRequestHandler,
    [GamePacketType.loginRequest]: loginRequestHandler,
    [GamePacketType.createRoomRequest]: createRoomRequestHandler,
    [GamePacketType.getRoomListRequest]: getRoomListRequestHandler,
    [GamePacketType.joinRoomRequest]: joinRoomRequestHandler,
    [GamePacketType.joinRandomRoomRequest]: joinRandomRoomRequestHandler,
    [GamePacketType.leaveRoomRequest]: leaveRoomRequestHandler,
    [GamePacketType.gamePrepareRequest]: gamePrepareRequestHandler,
    [GamePacketType.gameStartRequest]: gameStartRequestHandler,
    [GamePacketType.positionUpdateRequest]: positionUpdateRequestHandler,
    [GamePacketType.useCardRequest]: useCardRequestHandler,
    [GamePacketType.fleaMarketPickRequest]: fleaMarketPickRequestHandler,
    [GamePacketType.reactionRequest]: reactionRequestHandler,
    [GamePacketType.destroyCardRequest]: destroyCardRequestHandler,
    [GamePacketType.cardSelectRequest]: cardSelectRequestHandler,
    [GamePacketType.passDebuffRequest]: passDebuffRequestHandler,

    // Responses
    [GamePacketType.registerResponse]: registerResponseHandler,
    [GamePacketType.loginResponse]: loginResponseHandler,
    [GamePacketType.createRoomResponse]: createRoomResponseHandler,
    [GamePacketType.getRoomListResponse]: getRoomListResponseHandler,
    [GamePacketType.joinRoomResponse]: joinRoomResponseHandler,
    [GamePacketType.joinRandomRoomResponse]: joinRandomRoomResponseHandler,
    [GamePacketType.leaveRoomResponse]: leaveRoomResponseHandler,
    [GamePacketType.gamePrepareResponse]: gamePrepareResponseHandler,
    [GamePacketType.gameStartResponse]: gameStartResponseHandler,
    [GamePacketType.useCardResponse]: useCardResponseHandler,
    [GamePacketType.fleaMarketPickResponse]: fleaMarketPickResponseHandler,
    [GamePacketType.reactionResponse]: reactionResponseHandler,
    [GamePacketType.destroyCardResponse]: destroyCardResponseHandler,
    [GamePacketType.cardSelectResponse]: cardSelectResponseHandler,
    [GamePacketType.passDebuffResponse]: passDebuffResponseHandler,

    // Notifications
    [GamePacketType.joinRoomNotification]: joinRoomNotificationHandler,
    [GamePacketType.leaveRoomNotification]: leaveRoomNotificationHandler,
    [GamePacketType.gamePrepareNotification]: gamePrepareNotificationHandler,
    [GamePacketType.gameStartNotification]: gameStartNotificationHandler,
    [GamePacketType.positionUpdateNotification]: positionUpdateNotificationHandler,
    [GamePacketType.useCardNotification]: useCardNotificationHandler,
    [GamePacketType.equipCardNotification]: equipCardNotificationHandler,
    [GamePacketType.cardEffectNotification]: cardEffectNotificationHandler,
    [GamePacketType.fleaMarketNotification]: fleaMarketNotificationHandler,
    [GamePacketType.userUpdateNotification]: userUpdateNotificationHandler,
    [GamePacketType.phaseUpdateNotification]: phaseUpdateNotificationHandler,
    [GamePacketType.gameEndNotification]: gameEndNotificationHandler,
    [GamePacketType.warningNotification]: warningNotificationHandler,
    [GamePacketType.animationNotification]: animationNotificationHandler,
};

export function handleGamePacket(socket: Socket, gamePacket: GamePacket) {
    const { payload } = gamePacket;

    if (!payload.oneofKind) {
        console.warn("Received packet with no oneofKind payload.");
        return;
    }

    const packetType = payload.oneofKind as GamePacketType;
    const handler = handlers[packetType];


    if (handler) {
        // The handler function is called with the socket and the specific payload
        handler(socket, gamePacket);
    } else {
        console.log(`Ignoring packet with no handler: ${packetType}`);
    }
}

