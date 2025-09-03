import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { AnimationType } from "../common/enums";
import { WarningType } from "../common/enums";
import { WinType } from "../common/enums";
import { PhaseType } from "../common/enums";
import { CardType } from "../common/enums";
import { CharacterPositionData } from "../common/types";
import { GameStateData } from "../common/types";
import { RoomData } from "../common/types";
import { UserData } from "../common/types";
/**
 * @generated from protobuf message S2CJoinRoomNotification
 */
export interface S2CJoinRoomNotification {
    /**
     * @generated from protobuf field: UserData joinUser = 1
     */
    joinUser?: UserData;
}
/**
 * @generated from protobuf message S2CLeaveRoomNotification
 */
export interface S2CLeaveRoomNotification {
    /**
     * @generated from protobuf field: int64 userId = 1
     */
    userId: string;
}
/**
 * @generated from protobuf message S2CGamePrepareNotification
 */
export interface S2CGamePrepareNotification {
    /**
     * @generated from protobuf field: RoomData room = 1
     */
    room?: RoomData;
}
/**
 * @generated from protobuf message S2CGameStartNotification
 */
export interface S2CGameStartNotification {
    /**
     * @generated from protobuf field: GameStateData gameState = 1
     */
    gameState?: GameStateData;
    /**
     * @generated from protobuf field: repeated UserData users = 2
     */
    users: UserData[];
    /**
     * @generated from protobuf field: repeated CharacterPositionData characterPositions = 3
     */
    characterPositions: CharacterPositionData[];
}
/**
 * @generated from protobuf message S2CPositionUpdateNotification
 */
export interface S2CPositionUpdateNotification {
    /**
     * @generated from protobuf field: repeated CharacterPositionData characterPositions = 1
     */
    characterPositions: CharacterPositionData[];
}
/**
 * @generated from protobuf message S2CUseCardNotification
 */
export interface S2CUseCardNotification {
    /**
     * @generated from protobuf field: CardType cardType = 1
     */
    cardType: CardType;
    /**
     * @generated from protobuf field: int64 userId = 2
     */
    userId: string;
    /**
     * @generated from protobuf field: int64 targetUserId = 3
     */
    targetUserId: string;
}
/**
 * @generated from protobuf message S2CEquipCardNotification
 */
export interface S2CEquipCardNotification {
    /**
     * @generated from protobuf field: CardType cardType = 1
     */
    cardType: CardType;
    /**
     * @generated from protobuf field: int64 userId = 2
     */
    userId: string;
}
/**
 * @generated from protobuf message S2CCardEffectNotification
 */
export interface S2CCardEffectNotification {
    /**
     * @generated from protobuf field: CardType cardType = 1
     */
    cardType: CardType;
    /**
     * @generated from protobuf field: int64 userId = 2
     */
    userId: string;
    /**
     * @generated from protobuf field: bool success = 3
     */
    success: boolean;
}
/**
 * @generated from protobuf message S2CFleaMarketNotification
 */
export interface S2CFleaMarketNotification {
    /**
     * @generated from protobuf field: repeated CardType cardTypes = 1
     */
    cardTypes: CardType[];
    /**
     * @generated from protobuf field: repeated int32 pickIndex = 2
     */
    pickIndex: number[];
}
/**
 * @generated from protobuf message S2CUserUpdateNotification
 */
export interface S2CUserUpdateNotification {
    /**
     * @generated from protobuf field: repeated UserData user = 1
     */
    user: UserData[];
}
/**
 * @generated from protobuf message S2CPhaseUpdateNotification
 */
export interface S2CPhaseUpdateNotification {
    /**
     * @generated from protobuf field: PhaseType phaseType = 1
     */
    phaseType: PhaseType;
    /**
     * @generated from protobuf field: int64 nextPhaseAt = 2
     */
    nextPhaseAt: string;
    /**
     * @generated from protobuf field: repeated CharacterPositionData characterPositions = 3
     */
    characterPositions: CharacterPositionData[];
}
/**
 * @generated from protobuf message S2CGameEndNotification
 */
export interface S2CGameEndNotification {
    /**
     * @generated from protobuf field: repeated int64 winners = 1
     */
    winners: string[];
    /**
     * @generated from protobuf field: WinType winType = 2
     */
    winType: WinType;
}
/**
 * @generated from protobuf message S2CWarningNotification
 */
export interface S2CWarningNotification {
    /**
     * @generated from protobuf field: WarningType warningType = 1
     */
    warningType: WarningType;
    /**
     * @generated from protobuf field: int64 expectedAt = 2
     */
    expectedAt: string;
}
/**
 * @generated from protobuf message S2CAnimationNotification
 */
export interface S2CAnimationNotification {
    /**
     * @generated from protobuf field: int64 userId = 1
     */
    userId: string;
    /**
     * @generated from protobuf field: AnimationType animationType = 2
     */
    animationType: AnimationType;
}
declare class S2CJoinRoomNotification$Type extends MessageType<S2CJoinRoomNotification> {
    constructor();
    create(value?: PartialMessage<S2CJoinRoomNotification>): S2CJoinRoomNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CJoinRoomNotification): S2CJoinRoomNotification;
    internalBinaryWrite(message: S2CJoinRoomNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CJoinRoomNotification
 */
export declare const S2CJoinRoomNotification: S2CJoinRoomNotification$Type;
declare class S2CLeaveRoomNotification$Type extends MessageType<S2CLeaveRoomNotification> {
    constructor();
    create(value?: PartialMessage<S2CLeaveRoomNotification>): S2CLeaveRoomNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CLeaveRoomNotification): S2CLeaveRoomNotification;
    internalBinaryWrite(message: S2CLeaveRoomNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CLeaveRoomNotification
 */
export declare const S2CLeaveRoomNotification: S2CLeaveRoomNotification$Type;
declare class S2CGamePrepareNotification$Type extends MessageType<S2CGamePrepareNotification> {
    constructor();
    create(value?: PartialMessage<S2CGamePrepareNotification>): S2CGamePrepareNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CGamePrepareNotification): S2CGamePrepareNotification;
    internalBinaryWrite(message: S2CGamePrepareNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CGamePrepareNotification
 */
export declare const S2CGamePrepareNotification: S2CGamePrepareNotification$Type;
declare class S2CGameStartNotification$Type extends MessageType<S2CGameStartNotification> {
    constructor();
    create(value?: PartialMessage<S2CGameStartNotification>): S2CGameStartNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CGameStartNotification): S2CGameStartNotification;
    internalBinaryWrite(message: S2CGameStartNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CGameStartNotification
 */
export declare const S2CGameStartNotification: S2CGameStartNotification$Type;
declare class S2CPositionUpdateNotification$Type extends MessageType<S2CPositionUpdateNotification> {
    constructor();
    create(value?: PartialMessage<S2CPositionUpdateNotification>): S2CPositionUpdateNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CPositionUpdateNotification): S2CPositionUpdateNotification;
    internalBinaryWrite(message: S2CPositionUpdateNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CPositionUpdateNotification
 */
export declare const S2CPositionUpdateNotification: S2CPositionUpdateNotification$Type;
declare class S2CUseCardNotification$Type extends MessageType<S2CUseCardNotification> {
    constructor();
    create(value?: PartialMessage<S2CUseCardNotification>): S2CUseCardNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CUseCardNotification): S2CUseCardNotification;
    internalBinaryWrite(message: S2CUseCardNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CUseCardNotification
 */
export declare const S2CUseCardNotification: S2CUseCardNotification$Type;
declare class S2CEquipCardNotification$Type extends MessageType<S2CEquipCardNotification> {
    constructor();
    create(value?: PartialMessage<S2CEquipCardNotification>): S2CEquipCardNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CEquipCardNotification): S2CEquipCardNotification;
    internalBinaryWrite(message: S2CEquipCardNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CEquipCardNotification
 */
export declare const S2CEquipCardNotification: S2CEquipCardNotification$Type;
declare class S2CCardEffectNotification$Type extends MessageType<S2CCardEffectNotification> {
    constructor();
    create(value?: PartialMessage<S2CCardEffectNotification>): S2CCardEffectNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CCardEffectNotification): S2CCardEffectNotification;
    internalBinaryWrite(message: S2CCardEffectNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CCardEffectNotification
 */
export declare const S2CCardEffectNotification: S2CCardEffectNotification$Type;
declare class S2CFleaMarketNotification$Type extends MessageType<S2CFleaMarketNotification> {
    constructor();
    create(value?: PartialMessage<S2CFleaMarketNotification>): S2CFleaMarketNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CFleaMarketNotification): S2CFleaMarketNotification;
    internalBinaryWrite(message: S2CFleaMarketNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CFleaMarketNotification
 */
export declare const S2CFleaMarketNotification: S2CFleaMarketNotification$Type;
declare class S2CUserUpdateNotification$Type extends MessageType<S2CUserUpdateNotification> {
    constructor();
    create(value?: PartialMessage<S2CUserUpdateNotification>): S2CUserUpdateNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CUserUpdateNotification): S2CUserUpdateNotification;
    internalBinaryWrite(message: S2CUserUpdateNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CUserUpdateNotification
 */
export declare const S2CUserUpdateNotification: S2CUserUpdateNotification$Type;
declare class S2CPhaseUpdateNotification$Type extends MessageType<S2CPhaseUpdateNotification> {
    constructor();
    create(value?: PartialMessage<S2CPhaseUpdateNotification>): S2CPhaseUpdateNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CPhaseUpdateNotification): S2CPhaseUpdateNotification;
    internalBinaryWrite(message: S2CPhaseUpdateNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CPhaseUpdateNotification
 */
export declare const S2CPhaseUpdateNotification: S2CPhaseUpdateNotification$Type;
declare class S2CGameEndNotification$Type extends MessageType<S2CGameEndNotification> {
    constructor();
    create(value?: PartialMessage<S2CGameEndNotification>): S2CGameEndNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CGameEndNotification): S2CGameEndNotification;
    internalBinaryWrite(message: S2CGameEndNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CGameEndNotification
 */
export declare const S2CGameEndNotification: S2CGameEndNotification$Type;
declare class S2CWarningNotification$Type extends MessageType<S2CWarningNotification> {
    constructor();
    create(value?: PartialMessage<S2CWarningNotification>): S2CWarningNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CWarningNotification): S2CWarningNotification;
    internalBinaryWrite(message: S2CWarningNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CWarningNotification
 */
export declare const S2CWarningNotification: S2CWarningNotification$Type;
declare class S2CAnimationNotification$Type extends MessageType<S2CAnimationNotification> {
    constructor();
    create(value?: PartialMessage<S2CAnimationNotification>): S2CAnimationNotification;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: S2CAnimationNotification): S2CAnimationNotification;
    internalBinaryWrite(message: S2CAnimationNotification, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message S2CAnimationNotification
 */
export declare const S2CAnimationNotification: S2CAnimationNotification$Type;
export {};
//# sourceMappingURL=notifications.d.ts.map