import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { UserData } from "../common/types";
import { GlobalFailCode } from "../common/enums";
/**
 *
 * 패킷 명세
 *
 * @generated from protobuf message C2SRegisterRequest
 */
export interface C2SRegisterRequest {
    /**
     * @generated from protobuf field: string email = 1
     */
    email: string;
    /**
     * @generated from protobuf field: string nickname = 2
     */
    nickname: string;
    /**
     * @generated from protobuf field: string password = 3
     */
    password: string;
}
/**
 * @generated from protobuf message S2CRegisterResponse
 */
export interface S2CRegisterResponse {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: string message = 2
     */
    message: string;
    /**
     * @generated from protobuf field: GlobalFailCode failCode = 3
     */
    failCode: GlobalFailCode;
}
/**
 * @generated from protobuf message C2SLoginRequest
 */
export interface C2SLoginRequest {
    /**
     * @generated from protobuf field: string email = 1
     */
    email: string;
    /**
     * @generated from protobuf field: string password = 2
     */
    password: string;
}
/**
 * @generated from protobuf message S2CLoginResponse
 */
export interface S2CLoginResponse {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: string message = 2
     */
    message: string;
    /**
     * @generated from protobuf field: string token = 3
     */
    token: string;
    /**
     * @generated from protobuf field: UserData myInfo = 4
     */
    myInfo?: UserData;
    /**
     * @generated from protobuf field: GlobalFailCode failCode = 5
     */
    failCode: GlobalFailCode;
}
declare class C2SRegisterRequest$Type extends MessageType<C2SRegisterRequest> {
    constructor();
    create(value?: PartialMessage<C2SRegisterRequest>): C2SRegisterRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SRegisterRequest): C2SRegisterRequest;
    internalBinaryWrite(message: C2SRegisterRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SRegisterRequest
 */
export declare const C2SRegisterRequest: C2SRegisterRequest$Type;
declare class S2CRegisterResponse$Type extends MessageType<S2CRegisterResponse> {
    constructor();
    create(value?: PartialMessage<S2CRegisterResponse>): S2CRegisterResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CRegisterResponse): S2CRegisterResponse;
    internalBinaryWrite(message: S2CRegisterResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CRegisterResponse
 */
export declare const S2CRegisterResponse: S2CRegisterResponse$Type;
declare class C2SLoginRequest$Type extends MessageType<C2SLoginRequest> {
    constructor();
    create(value?: PartialMessage<C2SLoginRequest>): C2SLoginRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: C2SLoginRequest): C2SLoginRequest;
    internalBinaryWrite(message: C2SLoginRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message C2SLoginRequest
 */
export declare const C2SLoginRequest: C2SLoginRequest$Type;
declare class S2CLoginResponse$Type extends MessageType<S2CLoginResponse> {
    constructor();
    create(value?: PartialMessage<S2CLoginResponse>): S2CLoginResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CLoginResponse): S2CLoginResponse;
    internalBinaryWrite(message: S2CLoginResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CLoginResponse
 */
export declare const S2CLoginResponse: S2CLoginResponse$Type;
export {};
//# sourceMappingURL=auth.d.ts.map