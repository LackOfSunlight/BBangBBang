import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { S2CAnimationNotification } from "./packet/notifications";
import { S2CWarningNotification } from "./packet/notifications";
import { S2CPassDebuffResponse } from "./packet/game_actions";
import { C2SPassDebuffRequest } from "./packet/game_actions";
import { S2CCardSelectResponse } from "./packet/game_actions";
import { C2SCardSelectRequest } from "./packet/game_actions";
import { S2CGameEndNotification } from "./packet/notifications";
import { S2CDestroyCardResponse } from "./packet/game_actions";
import { C2SDestroyCardRequest } from "./packet/game_actions";
import { S2CReactionResponse } from "./packet/game_actions";
import { C2SReactionRequest } from "./packet/game_actions";
import { S2CPhaseUpdateNotification } from "./packet/notifications";
import { S2CUserUpdateNotification } from "./packet/notifications";
import { S2CFleaMarketPickResponse } from "./packet/game_actions";
import { C2SFleaMarketPickRequest } from "./packet/game_actions";
import { S2CFleaMarketNotification } from "./packet/notifications";
import { S2CCardEffectNotification } from "./packet/notifications";
import { S2CEquipCardNotification } from "./packet/notifications";
import { S2CUseCardNotification } from "./packet/notifications";
import { S2CUseCardResponse } from "./packet/game_actions";
import { C2SUseCardRequest } from "./packet/game_actions";
import { S2CPositionUpdateNotification } from "./packet/notifications";
import { C2SPositionUpdateRequest } from "./packet/game_actions";
import { S2CGameStartNotification } from "./packet/notifications";
import { S2CGameStartResponse } from "./packet/game_actions";
import { C2SGameStartRequest } from "./packet/game_actions";
import { S2CGamePrepareNotification } from "./packet/notifications";
import { S2CGamePrepareResponse } from "./packet/game_actions";
import { C2SGamePrepareRequest } from "./packet/game_actions";
import { S2CLeaveRoomNotification } from "./packet/notifications";
import { S2CLeaveRoomResponse } from "./packet/room_actions";
import { C2SLeaveRoomRequest } from "./packet/room_actions";
import { S2CJoinRoomNotification } from "./packet/notifications";
import { S2CJoinRandomRoomResponse } from "./packet/room_actions";
import { C2SJoinRandomRoomRequest } from "./packet/room_actions";
import { S2CJoinRoomResponse } from "./packet/room_actions";
import { C2SJoinRoomRequest } from "./packet/room_actions";
import { S2CGetRoomListResponse } from "./packet/room_actions";
import { C2SGetRoomListRequest } from "./packet/room_actions";
import { S2CCreateRoomResponse } from "./packet/room_actions";
import { C2SCreateRoomRequest } from "./packet/room_actions";
import { S2CLoginResponse } from "./packet/auth";
import { C2SLoginRequest } from "./packet/auth";
import { S2CRegisterResponse } from "./packet/auth";
import { C2SRegisterRequest } from "./packet/auth";
/**
 * 최상위 GamePacket 메시지
 *
 * @generated from protobuf message GamePacket
 */
export interface GamePacket {
    /**
     * @generated from protobuf oneof: payload
     */
    payload: {
        oneofKind: "registerRequest";
        /**
         * 회원가입 및 로그인
         *
         * @generated from protobuf field: C2SRegisterRequest registerRequest = 1
         */
        registerRequest: C2SRegisterRequest;
    } | {
        oneofKind: "registerResponse";
        /**
         * @generated from protobuf field: S2CRegisterResponse registerResponse = 2
         */
        registerResponse: S2CRegisterResponse;
    } | {
        oneofKind: "loginRequest";
        /**
         * @generated from protobuf field: C2SLoginRequest loginRequest = 3
         */
        loginRequest: C2SLoginRequest;
    } | {
        oneofKind: "loginResponse";
        /**
         * @generated from protobuf field: S2CLoginResponse loginResponse = 4
         */
        loginResponse: S2CLoginResponse;
    } | {
        oneofKind: "createRoomRequest";
        /**
         * 방 생성
         *
         * @generated from protobuf field: C2SCreateRoomRequest createRoomRequest = 5
         */
        createRoomRequest: C2SCreateRoomRequest;
    } | {
        oneofKind: "createRoomResponse";
        /**
         * @generated from protobuf field: S2CCreateRoomResponse createRoomResponse = 6
         */
        createRoomResponse: S2CCreateRoomResponse;
    } | {
        oneofKind: "getRoomListRequest";
        /**
         * 방 목록 조회
         *
         * @generated from protobuf field: C2SGetRoomListRequest getRoomListRequest = 7
         */
        getRoomListRequest: C2SGetRoomListRequest;
    } | {
        oneofKind: "getRoomListResponse";
        /**
         * @generated from protobuf field: S2CGetRoomListResponse getRoomListResponse = 8
         */
        getRoomListResponse: S2CGetRoomListResponse;
    } | {
        oneofKind: "joinRoomRequest";
        /**
         * 방 참가
         *
         * @generated from protobuf field: C2SJoinRoomRequest joinRoomRequest = 9
         */
        joinRoomRequest: C2SJoinRoomRequest;
    } | {
        oneofKind: "joinRoomResponse";
        /**
         * @generated from protobuf field: S2CJoinRoomResponse joinRoomResponse = 10
         */
        joinRoomResponse: S2CJoinRoomResponse;
    } | {
        oneofKind: "joinRandomRoomRequest";
        /**
         * 랜덤 방 참가
         *
         * @generated from protobuf field: C2SJoinRandomRoomRequest joinRandomRoomRequest = 11
         */
        joinRandomRoomRequest: C2SJoinRandomRoomRequest;
    } | {
        oneofKind: "joinRandomRoomResponse";
        /**
         * @generated from protobuf field: S2CJoinRandomRoomResponse joinRandomRoomResponse = 12
         */
        joinRandomRoomResponse: S2CJoinRandomRoomResponse;
    } | {
        oneofKind: "joinRoomNotification";
        /**
         * 방 참가 알림
         *
         * @generated from protobuf field: S2CJoinRoomNotification joinRoomNotification = 13
         */
        joinRoomNotification: S2CJoinRoomNotification;
    } | {
        oneofKind: "leaveRoomRequest";
        /**
         * 방 나가기
         *
         * @generated from protobuf field: C2SLeaveRoomRequest leaveRoomRequest = 14
         */
        leaveRoomRequest: C2SLeaveRoomRequest;
    } | {
        oneofKind: "leaveRoomResponse";
        /**
         * @generated from protobuf field: S2CLeaveRoomResponse leaveRoomResponse = 15
         */
        leaveRoomResponse: S2CLeaveRoomResponse;
    } | {
        oneofKind: "leaveRoomNotification";
        /**
         * 방 나가기 알림
         *
         * @generated from protobuf field: S2CLeaveRoomNotification leaveRoomNotification = 16
         */
        leaveRoomNotification: S2CLeaveRoomNotification;
    } | {
        oneofKind: "gamePrepareRequest";
        /**
         * 게임 시작 전 역할 및 캐릭터 셔플 요청
         *
         * @generated from protobuf field: C2SGamePrepareRequest gamePrepareRequest = 17
         */
        gamePrepareRequest: C2SGamePrepareRequest;
    } | {
        oneofKind: "gamePrepareResponse";
        /**
         * @generated from protobuf field: S2CGamePrepareResponse gamePrepareResponse = 18
         */
        gamePrepareResponse: S2CGamePrepareResponse;
    } | {
        oneofKind: "gamePrepareNotification";
        /**
         * @generated from protobuf field: S2CGamePrepareNotification gamePrepareNotification = 19
         */
        gamePrepareNotification: S2CGamePrepareNotification;
    } | {
        oneofKind: "gameStartRequest";
        /**
         * 게임 시작
         *
         * @generated from protobuf field: C2SGameStartRequest gameStartRequest = 20
         */
        gameStartRequest: C2SGameStartRequest;
    } | {
        oneofKind: "gameStartResponse";
        /**
         * @generated from protobuf field: S2CGameStartResponse gameStartResponse = 21
         */
        gameStartResponse: S2CGameStartResponse;
    } | {
        oneofKind: "gameStartNotification";
        /**
         * @generated from protobuf field: S2CGameStartNotification gameStartNotification = 22
         */
        gameStartNotification: S2CGameStartNotification;
    } | {
        oneofKind: "positionUpdateRequest";
        /**
         * 위치 업데이트
         *
         * @generated from protobuf field: C2SPositionUpdateRequest positionUpdateRequest = 23
         */
        positionUpdateRequest: C2SPositionUpdateRequest;
    } | {
        oneofKind: "positionUpdateNotification";
        /**
         * @generated from protobuf field: S2CPositionUpdateNotification positionUpdateNotification = 24
         */
        positionUpdateNotification: S2CPositionUpdateNotification;
    } | {
        oneofKind: "useCardRequest";
        /**
         * 카드 사용
         *
         * @generated from protobuf field: C2SUseCardRequest useCardRequest = 25
         */
        useCardRequest: C2SUseCardRequest;
    } | {
        oneofKind: "useCardResponse";
        /**
         * @generated from protobuf field: S2CUseCardResponse useCardResponse = 26
         */
        useCardResponse: S2CUseCardResponse;
    } | {
        oneofKind: "useCardNotification";
        /**
         * 카드 효과 알림
         *
         * @generated from protobuf field: S2CUseCardNotification useCardNotification = 27
         */
        useCardNotification: S2CUseCardNotification;
    } | {
        oneofKind: "equipCardNotification";
        /**
         * @generated from protobuf field: S2CEquipCardNotification equipCardNotification = 28
         */
        equipCardNotification: S2CEquipCardNotification;
    } | {
        oneofKind: "cardEffectNotification";
        /**
         * @generated from protobuf field: S2CCardEffectNotification cardEffectNotification = 29
         */
        cardEffectNotification: S2CCardEffectNotification;
    } | {
        oneofKind: "fleaMarketNotification";
        /**
         * 플리마켓
         *
         * @generated from protobuf field: S2CFleaMarketNotification fleaMarketNotification = 30
         */
        fleaMarketNotification: S2CFleaMarketNotification;
    } | {
        oneofKind: "fleaMarketPickRequest";
        /**
         * @generated from protobuf field: C2SFleaMarketPickRequest fleaMarketPickRequest = 31
         */
        fleaMarketPickRequest: C2SFleaMarketPickRequest;
    } | {
        oneofKind: "fleaMarketPickResponse";
        /**
         * @generated from protobuf field: S2CFleaMarketPickResponse fleaMarketPickResponse = 32
         */
        fleaMarketPickResponse: S2CFleaMarketPickResponse;
    } | {
        oneofKind: "userUpdateNotification";
        /**
         * 카드 사용 등으로 인한 유저 정보 업데이트
         *
         * @generated from protobuf field: S2CUserUpdateNotification userUpdateNotification = 33
         */
        userUpdateNotification: S2CUserUpdateNotification;
    } | {
        oneofKind: "phaseUpdateNotification";
        /**
         * 페이즈 업데이트
         *
         * @generated from protobuf field: S2CPhaseUpdateNotification phaseUpdateNotification = 34
         */
        phaseUpdateNotification: S2CPhaseUpdateNotification;
    } | {
        oneofKind: "reactionRequest";
        /**
         * 리액션
         *
         * @generated from protobuf field: C2SReactionRequest reactionRequest = 35
         */
        reactionRequest: C2SReactionRequest;
    } | {
        oneofKind: "reactionResponse";
        /**
         * @generated from protobuf field: S2CReactionResponse reactionResponse = 36
         */
        reactionResponse: S2CReactionResponse;
    } | {
        oneofKind: "destroyCardRequest";
        /**
         * 턴 종료시 (phaseType 3) 카드 버리기
         *
         * @generated from protobuf field: C2SDestroyCardRequest destroyCardRequest = 37
         */
        destroyCardRequest: C2SDestroyCardRequest;
    } | {
        oneofKind: "destroyCardResponse";
        /**
         * @generated from protobuf field: S2CDestroyCardResponse destroyCardResponse = 38
         */
        destroyCardResponse: S2CDestroyCardResponse;
    } | {
        oneofKind: "gameEndNotification";
        /**
         * 게임 종료
         *
         * @generated from protobuf field: S2CGameEndNotification gameEndNotification = 39
         */
        gameEndNotification: S2CGameEndNotification;
    } | {
        oneofKind: "cardSelectRequest";
        /**
         * 카드 선택
         *
         * @generated from protobuf field: C2SCardSelectRequest cardSelectRequest = 40
         */
        cardSelectRequest: C2SCardSelectRequest;
    } | {
        oneofKind: "cardSelectResponse";
        /**
         * @generated from protobuf field: S2CCardSelectResponse cardSelectResponse = 41
         */
        cardSelectResponse: S2CCardSelectResponse;
    } | {
        oneofKind: "passDebuffRequest";
        /**
         * 디버프 넘기기
         *
         * @generated from protobuf field: C2SPassDebuffRequest passDebuffRequest = 42
         */
        passDebuffRequest: C2SPassDebuffRequest;
    } | {
        oneofKind: "passDebuffResponse";
        /**
         * @generated from protobuf field: S2CPassDebuffResponse passDebuffResponse = 43
         */
        passDebuffResponse: S2CPassDebuffResponse;
    } | {
        oneofKind: "warningNotification";
        /**
         * @generated from protobuf field: S2CWarningNotification warningNotification = 44
         */
        warningNotification: S2CWarningNotification;
    } | {
        oneofKind: "animationNotification";
        /**
         * 효과 알림
         *
         * @generated from protobuf field: S2CAnimationNotification animationNotification = 45
         */
        animationNotification: S2CAnimationNotification;
    } | {
        oneofKind: undefined;
    };
}
declare class GamePacket$Type extends MessageType<GamePacket> {
    constructor();
    create(value?: PartialMessage<GamePacket>): GamePacket;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GamePacket): GamePacket;
    internalBinaryWrite(message: GamePacket, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message GamePacket
 */
export declare const GamePacket: GamePacket$Type;
export {};
//# sourceMappingURL=gamePacket.d.ts.map