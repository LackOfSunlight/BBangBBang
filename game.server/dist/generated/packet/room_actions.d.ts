import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { GlobalFailCode } from "../common/enums";
import { RoomData } from "../common/types";
/**
 * @generated from protobuf message C2SCreateRoomRequest
 */
export interface C2SCreateRoomRequest {
    /**
     * @generated from protobuf field: string name = 1
     */
    name: string;
    /**
     * @generated from protobuf field: int32 maxUserNum = 2
     */
    maxUserNum: number;
}
/**
 * @generated from protobuf message S2CCreateRoomResponse
 */
export interface S2CCreateRoomResponse {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: RoomData room = 2
     */
    room?: RoomData;
    /**
     * @generated from protobuf field: GlobalFailCode failCode = 3
     */
    failCode: GlobalFailCode;
}
/**
 * @generated from protobuf message C2SGetRoomListRequest
 */
export interface C2SGetRoomListRequest {
}
/**
 * @generated from protobuf message S2CGetRoomListResponse
 */
export interface S2CGetRoomListResponse {
    /**
     * @generated from protobuf field: repeated RoomData rooms = 1
     */
    rooms: RoomData[];
}
/**
 * @generated from protobuf message C2SJoinRoomRequest
 */
export interface C2SJoinRoomRequest {
    /**
     * @generated from protobuf field: int32 roomId = 1
     */
    roomId: number;
}
/**
 * @generated from protobuf message S2CJoinRoomResponse
 */
export interface S2CJoinRoomResponse {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: RoomData room = 2
     */
    room?: RoomData;
    /**
     * @generated from protobuf field: GlobalFailCode failCode = 3
     */
    failCode: GlobalFailCode;
}
/**
 * @generated from protobuf message C2SJoinRandomRoomRequest
 */
export interface C2SJoinRandomRoomRequest {
}
/**
 * @generated from protobuf message S2CJoinRandomRoomResponse
 */
export interface S2CJoinRandomRoomResponse {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: RoomData room = 2
     */
    room?: RoomData;
    /**
     * @generated from protobuf field: GlobalFailCode failCode = 3
     */
    failCode: GlobalFailCode;
}
/**
 * @generated from protobuf message C2SLeaveRoomRequest
 */
export interface C2SLeaveRoomRequest {
}
/**
 * @generated from protobuf message S2CLeaveRoomResponse
 */
export interface S2CLeaveRoomResponse {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: GlobalFailCode failCode = 2
     */
    failCode: GlobalFailCode;
}
declare class C2SCreateRoomRequest$Type extends MessageType<C2SCreateRoomRequest> {
    constructor();
    create(value?: PartialMessage<C2SCreateRoomRequest>): C2SCreateRoomRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SCreateRoomRequest): C2SCreateRoomRequest;
    internalBinaryWrite(message: C2SCreateRoomRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SCreateRoomRequest
 */
export declare const C2SCreateRoomRequest: C2SCreateRoomRequest$Type;
declare class S2CCreateRoomResponse$Type extends MessageType<S2CCreateRoomResponse> {
    constructor();
    create(value?: PartialMessage<S2CCreateRoomResponse>): S2CCreateRoomResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CCreateRoomResponse): S2CCreateRoomResponse;
    internalBinaryWrite(message: S2CCreateRoomResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CCreateRoomResponse
 */
export declare const S2CCreateRoomResponse: S2CCreateRoomResponse$Type;
declare class C2SGetRoomListRequest$Type extends MessageType<C2SGetRoomListRequest> {
    constructor();
    create(value?: PartialMessage<C2SGetRoomListRequest>): C2SGetRoomListRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SGetRoomListRequest): C2SGetRoomListRequest;
    internalBinaryWrite(message: C2SGetRoomListRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SGetRoomListRequest
 */
export declare const C2SGetRoomListRequest: C2SGetRoomListRequest$Type;
declare class S2CGetRoomListResponse$Type extends MessageType<S2CGetRoomListResponse> {
    constructor();
    create(value?: PartialMessage<S2CGetRoomListResponse>): S2CGetRoomListResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CGetRoomListResponse): S2CGetRoomListResponse;
    internalBinaryWrite(message: S2CGetRoomListResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CGetRoomListResponse
 */
export declare const S2CGetRoomListResponse: S2CGetRoomListResponse$Type;
declare class C2SJoinRoomRequest$Type extends MessageType<C2SJoinRoomRequest> {
    constructor();
    create(value?: PartialMessage<C2SJoinRoomRequest>): C2SJoinRoomRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SJoinRoomRequest): C2SJoinRoomRequest;
    internalBinaryWrite(message: C2SJoinRoomRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SJoinRoomRequest
 */
export declare const C2SJoinRoomRequest: C2SJoinRoomRequest$Type;
declare class S2CJoinRoomResponse$Type extends MessageType<S2CJoinRoomResponse> {
    constructor();
    create(value?: PartialMessage<S2CJoinRoomResponse>): S2CJoinRoomResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CJoinRoomResponse): S2CJoinRoomResponse;
    internalBinaryWrite(message: S2CJoinRoomResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CJoinRoomResponse
 */
export declare const S2CJoinRoomResponse: S2CJoinRoomResponse$Type;
declare class C2SJoinRandomRoomRequest$Type extends MessageType<C2SJoinRandomRoomRequest> {
    constructor();
    create(value?: PartialMessage<C2SJoinRandomRoomRequest>): C2SJoinRandomRoomRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SJoinRandomRoomRequest): C2SJoinRandomRoomRequest;
    internalBinaryWrite(message: C2SJoinRandomRoomRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SJoinRandomRoomRequest
 */
export declare const C2SJoinRandomRoomRequest: C2SJoinRandomRoomRequest$Type;
declare class S2CJoinRandomRoomResponse$Type extends MessageType<S2CJoinRandomRoomResponse> {
    constructor();
    create(value?: PartialMessage<S2CJoinRandomRoomResponse>): S2CJoinRandomRoomResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CJoinRandomRoomResponse): S2CJoinRandomRoomResponse;
    internalBinaryWrite(message: S2CJoinRandomRoomResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CJoinRandomRoomResponse
 */
export declare const S2CJoinRandomRoomResponse: S2CJoinRandomRoomResponse$Type;
declare class C2SLeaveRoomRequest$Type extends MessageType<C2SLeaveRoomRequest> {
    constructor();
    create(value?: PartialMessage<C2SLeaveRoomRequest>): C2SLeaveRoomRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SLeaveRoomRequest): C2SLeaveRoomRequest;
    internalBinaryWrite(message: C2SLeaveRoomRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SLeaveRoomRequest
 */
export declare const C2SLeaveRoomRequest: C2SLeaveRoomRequest$Type;
declare class S2CLeaveRoomResponse$Type extends MessageType<S2CLeaveRoomResponse> {
    constructor();
    create(value?: PartialMessage<S2CLeaveRoomResponse>): S2CLeaveRoomResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CLeaveRoomResponse): S2CLeaveRoomResponse;
    internalBinaryWrite(message: S2CLeaveRoomResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CLeaveRoomResponse
 */
export declare const S2CLeaveRoomResponse: S2CLeaveRoomResponse$Type;
export {};
//# sourceMappingURL=room_actions.d.ts.map