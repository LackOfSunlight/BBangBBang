import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { SelectCardType } from "../common/enums";
import { CardData } from "../common/types";
import { ReactionType } from "../common/enums";
import { CardType } from "../common/enums";
import { GlobalFailCode } from "../common/enums";
/**
 * 게임 시작 전 역할 및 캐릭터 셔플 요청
 *
 * @generated from protobuf message C2SGamePrepareRequest
 */
export interface C2SGamePrepareRequest {
}
/**
 * @generated from protobuf message S2CGamePrepareResponse
 */
export interface S2CGamePrepareResponse {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: GlobalFailCode failCode = 2
     */
    failCode: GlobalFailCode;
}
/**
 * @generated from protobuf message C2SGameStartRequest
 */
export interface C2SGameStartRequest {
}
/**
 * @generated from protobuf message S2CGameStartResponse
 */
export interface S2CGameStartResponse {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: GlobalFailCode failCode = 2
     */
    failCode: GlobalFailCode;
}
/**
 * @generated from protobuf message C2SPositionUpdateRequest
 */
export interface C2SPositionUpdateRequest {
    /**
     * @generated from protobuf field: double x = 1
     */
    x: number;
    /**
     * @generated from protobuf field: double y = 2
     */
    y: number;
}
/**
 * @generated from protobuf message S2CPositionUpdateResponse
 */
export interface S2CPositionUpdateResponse {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: GlobalFailCode failCode = 2
     */
    failCode: GlobalFailCode;
}
/**
 * @generated from protobuf message C2SUseCardRequest
 */
export interface C2SUseCardRequest {
    /**
     * @generated from protobuf field: CardType cardType = 1
     */
    cardType: CardType;
    /**
     * @generated from protobuf field: int64 targetUserId = 2
     */
    targetUserId: string;
}
/**
 * 성공 여부만 반환하고 대상 유저 효과는 S2CUserUpdateNotification로 통지
 *
 * @generated from protobuf message S2CUseCardResponse
 */
export interface S2CUseCardResponse {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: GlobalFailCode failCode = 2
     */
    failCode: GlobalFailCode;
}
/**
 * @generated from protobuf message C2SFleaMarketPickRequest
 */
export interface C2SFleaMarketPickRequest {
    /**
     * @generated from protobuf field: int32 pickIndex = 1
     */
    pickIndex: number;
}
/**
 * @generated from protobuf message S2CFleaMarketPickResponse
 */
export interface S2CFleaMarketPickResponse {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: GlobalFailCode failCode = 2
     */
    failCode: GlobalFailCode;
}
/**
 * @generated from protobuf message C2SReactionRequest
 */
export interface C2SReactionRequest {
    /**
     * @generated from protobuf field: ReactionType reactionType = 1
     */
    reactionType: ReactionType;
}
/**
 * @generated from protobuf message S2CReactionResponse
 */
export interface S2CReactionResponse {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: GlobalFailCode failCode = 2
     */
    failCode: GlobalFailCode;
}
/**
 * @generated from protobuf message C2SDestroyCardRequest
 */
export interface C2SDestroyCardRequest {
    /**
     * @generated from protobuf field: repeated CardData destroyCards = 1
     */
    destroyCards: CardData[];
}
/**
 * @generated from protobuf message S2CDestroyCardResponse
 */
export interface S2CDestroyCardResponse {
    /**
     * @generated from protobuf field: repeated CardData handCards = 1
     */
    handCards: CardData[];
}
/**
 * @generated from protobuf message C2SCardSelectRequest
 */
export interface C2SCardSelectRequest {
    /**
     * @generated from protobuf field: SelectCardType selectType = 1
     */
    selectType: SelectCardType;
    /**
     * @generated from protobuf field: CardType selectCardType = 2
     */
    selectCardType: CardType;
}
/**
 * @generated from protobuf message S2CCardSelectResponse
 */
export interface S2CCardSelectResponse {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: GlobalFailCode failCode = 2
     */
    failCode: GlobalFailCode;
}
/**
 * @generated from protobuf message C2SPassDebuffRequest
 */
export interface C2SPassDebuffRequest {
    /**
     * @generated from protobuf field: int64 targetUserId = 1
     */
    targetUserId: string;
    /**
     * @generated from protobuf field: CardType debuffCardType = 2
     */
    debuffCardType: CardType;
}
/**
 * @generated from protobuf message S2CPassDebuffResponse
 */
export interface S2CPassDebuffResponse {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: GlobalFailCode failCode = 2
     */
    failCode: GlobalFailCode;
}
declare class C2SGamePrepareRequest$Type extends MessageType<C2SGamePrepareRequest> {
    constructor();
    create(value?: PartialMessage<C2SGamePrepareRequest>): C2SGamePrepareRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SGamePrepareRequest): C2SGamePrepareRequest;
    internalBinaryWrite(message: C2SGamePrepareRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SGamePrepareRequest
 */
export declare const C2SGamePrepareRequest: C2SGamePrepareRequest$Type;
declare class S2CGamePrepareResponse$Type extends MessageType<S2CGamePrepareResponse> {
    constructor();
    create(value?: PartialMessage<S2CGamePrepareResponse>): S2CGamePrepareResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CGamePrepareResponse): S2CGamePrepareResponse;
    internalBinaryWrite(message: S2CGamePrepareResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CGamePrepareResponse
 */
export declare const S2CGamePrepareResponse: S2CGamePrepareResponse$Type;
declare class C2SGameStartRequest$Type extends MessageType<C2SGameStartRequest> {
    constructor();
    create(value?: PartialMessage<C2SGameStartRequest>): C2SGameStartRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SGameStartRequest): C2SGameStartRequest;
    internalBinaryWrite(message: C2SGameStartRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SGameStartRequest
 */
export declare const C2SGameStartRequest: C2SGameStartRequest$Type;
declare class S2CGameStartResponse$Type extends MessageType<S2CGameStartResponse> {
    constructor();
    create(value?: PartialMessage<S2CGameStartResponse>): S2CGameStartResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CGameStartResponse): S2CGameStartResponse;
    internalBinaryWrite(message: S2CGameStartResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CGameStartResponse
 */
export declare const S2CGameStartResponse: S2CGameStartResponse$Type;
declare class C2SPositionUpdateRequest$Type extends MessageType<C2SPositionUpdateRequest> {
    constructor();
    create(value?: PartialMessage<C2SPositionUpdateRequest>): C2SPositionUpdateRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SPositionUpdateRequest): C2SPositionUpdateRequest;
    internalBinaryWrite(message: C2SPositionUpdateRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SPositionUpdateRequest
 */
export declare const C2SPositionUpdateRequest: C2SPositionUpdateRequest$Type;
declare class S2CPositionUpdateResponse$Type extends MessageType<S2CPositionUpdateResponse> {
    constructor();
    create(value?: PartialMessage<S2CPositionUpdateResponse>): S2CPositionUpdateResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CPositionUpdateResponse): S2CPositionUpdateResponse;
    internalBinaryWrite(message: S2CPositionUpdateResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CPositionUpdateResponse
 */
export declare const S2CPositionUpdateResponse: S2CPositionUpdateResponse$Type;
declare class C2SUseCardRequest$Type extends MessageType<C2SUseCardRequest> {
    constructor();
    create(value?: PartialMessage<C2SUseCardRequest>): C2SUseCardRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SUseCardRequest): C2SUseCardRequest;
    internalBinaryWrite(message: C2SUseCardRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SUseCardRequest
 */
export declare const C2SUseCardRequest: C2SUseCardRequest$Type;
declare class S2CUseCardResponse$Type extends MessageType<S2CUseCardResponse> {
    constructor();
    create(value?: PartialMessage<S2CUseCardResponse>): S2CUseCardResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CUseCardResponse): S2CUseCardResponse;
    internalBinaryWrite(message: S2CUseCardResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CUseCardResponse
 */
export declare const S2CUseCardResponse: S2CUseCardResponse$Type;
declare class C2SFleaMarketPickRequest$Type extends MessageType<C2SFleaMarketPickRequest> {
    constructor();
    create(value?: PartialMessage<C2SFleaMarketPickRequest>): C2SFleaMarketPickRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SFleaMarketPickRequest): C2SFleaMarketPickRequest;
    internalBinaryWrite(message: C2SFleaMarketPickRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SFleaMarketPickRequest
 */
export declare const C2SFleaMarketPickRequest: C2SFleaMarketPickRequest$Type;
declare class S2CFleaMarketPickResponse$Type extends MessageType<S2CFleaMarketPickResponse> {
    constructor();
    create(value?: PartialMessage<S2CFleaMarketPickResponse>): S2CFleaMarketPickResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CFleaMarketPickResponse): S2CFleaMarketPickResponse;
    internalBinaryWrite(message: S2CFleaMarketPickResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CFleaMarketPickResponse
 */
export declare const S2CFleaMarketPickResponse: S2CFleaMarketPickResponse$Type;
declare class C2SReactionRequest$Type extends MessageType<C2SReactionRequest> {
    constructor();
    create(value?: PartialMessage<C2SReactionRequest>): C2SReactionRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SReactionRequest): C2SReactionRequest;
    internalBinaryWrite(message: C2SReactionRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SReactionRequest
 */
export declare const C2SReactionRequest: C2SReactionRequest$Type;
declare class S2CReactionResponse$Type extends MessageType<S2CReactionResponse> {
    constructor();
    create(value?: PartialMessage<S2CReactionResponse>): S2CReactionResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CReactionResponse): S2CReactionResponse;
    internalBinaryWrite(message: S2CReactionResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CReactionResponse
 */
export declare const S2CReactionResponse: S2CReactionResponse$Type;
declare class C2SDestroyCardRequest$Type extends MessageType<C2SDestroyCardRequest> {
    constructor();
    create(value?: PartialMessage<C2SDestroyCardRequest>): C2SDestroyCardRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SDestroyCardRequest): C2SDestroyCardRequest;
    internalBinaryWrite(message: C2SDestroyCardRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SDestroyCardRequest
 */
export declare const C2SDestroyCardRequest: C2SDestroyCardRequest$Type;
declare class S2CDestroyCardResponse$Type extends MessageType<S2CDestroyCardResponse> {
    constructor();
    create(value?: PartialMessage<S2CDestroyCardResponse>): S2CDestroyCardResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CDestroyCardResponse): S2CDestroyCardResponse;
    internalBinaryWrite(message: S2CDestroyCardResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CDestroyCardResponse
 */
export declare const S2CDestroyCardResponse: S2CDestroyCardResponse$Type;
declare class C2SCardSelectRequest$Type extends MessageType<C2SCardSelectRequest> {
    constructor();
    create(value?: PartialMessage<C2SCardSelectRequest>): C2SCardSelectRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SCardSelectRequest): C2SCardSelectRequest;
    internalBinaryWrite(message: C2SCardSelectRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SCardSelectRequest
 */
export declare const C2SCardSelectRequest: C2SCardSelectRequest$Type;
declare class S2CCardSelectResponse$Type extends MessageType<S2CCardSelectResponse> {
    constructor();
    create(value?: PartialMessage<S2CCardSelectResponse>): S2CCardSelectResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CCardSelectResponse): S2CCardSelectResponse;
    internalBinaryWrite(message: S2CCardSelectResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CCardSelectResponse
 */
export declare const S2CCardSelectResponse: S2CCardSelectResponse$Type;
declare class C2SPassDebuffRequest$Type extends MessageType<C2SPassDebuffRequest> {
    constructor();
    create(value?: PartialMessage<C2SPassDebuffRequest>): C2SPassDebuffRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SPassDebuffRequest): C2SPassDebuffRequest;
    internalBinaryWrite(message: C2SPassDebuffRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SPassDebuffRequest
 */
export declare const C2SPassDebuffRequest: C2SPassDebuffRequest$Type;
declare class S2CPassDebuffResponse$Type extends MessageType<S2CPassDebuffResponse> {
    constructor();
    create(value?: PartialMessage<S2CPassDebuffResponse>): S2CPassDebuffResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CPassDebuffResponse): S2CPassDebuffResponse;
    internalBinaryWrite(message: S2CPassDebuffResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CPassDebuffResponse
 */
export declare const S2CPassDebuffResponse: S2CPassDebuffResponse$Type;
export {};
//# sourceMappingURL=game_actions.d.ts.map