import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
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
// @generated message type with reflection information, may provide speed optimized methods
class S2CJoinRoomNotification$Type extends MessageType {
    constructor() {
        super("S2CJoinRoomNotification", [
            { no: 1, name: "joinUser", kind: "message", T: () => UserData }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* UserData joinUser */ 1:
                    message.joinUser = UserData.internalBinaryRead(reader, reader.uint32(), options, message.joinUser);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* UserData joinUser = 1; */
        if (message.joinUser)
            UserData.internalBinaryWrite(message.joinUser, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CJoinRoomNotification
 */
export const S2CJoinRoomNotification = new S2CJoinRoomNotification$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CLeaveRoomNotification$Type extends MessageType {
    constructor() {
        super("S2CLeaveRoomNotification", [
            { no: 1, name: "userId", kind: "scalar", T: 3 /*ScalarType.INT64*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.userId = "0";
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* int64 userId */ 1:
                    message.userId = reader.int64().toString();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* int64 userId = 1; */
        if (message.userId !== "0")
            writer.tag(1, WireType.Varint).int64(message.userId);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CLeaveRoomNotification
 */
export const S2CLeaveRoomNotification = new S2CLeaveRoomNotification$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CGamePrepareNotification$Type extends MessageType {
    constructor() {
        super("S2CGamePrepareNotification", [
            { no: 1, name: "room", kind: "message", T: () => RoomData }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* RoomData room */ 1:
                    message.room = RoomData.internalBinaryRead(reader, reader.uint32(), options, message.room);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* RoomData room = 1; */
        if (message.room)
            RoomData.internalBinaryWrite(message.room, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CGamePrepareNotification
 */
export const S2CGamePrepareNotification = new S2CGamePrepareNotification$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CGameStartNotification$Type extends MessageType {
    constructor() {
        super("S2CGameStartNotification", [
            { no: 1, name: "gameState", kind: "message", T: () => GameStateData },
            { no: 2, name: "users", kind: "message", repeat: 2 /*RepeatType.UNPACKED*/, T: () => UserData },
            { no: 3, name: "characterPositions", kind: "message", repeat: 2 /*RepeatType.UNPACKED*/, T: () => CharacterPositionData }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.users = [];
        message.characterPositions = [];
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* GameStateData gameState */ 1:
                    message.gameState = GameStateData.internalBinaryRead(reader, reader.uint32(), options, message.gameState);
                    break;
                case /* repeated UserData users */ 2:
                    message.users.push(UserData.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* repeated CharacterPositionData characterPositions */ 3:
                    message.characterPositions.push(CharacterPositionData.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* GameStateData gameState = 1; */
        if (message.gameState)
            GameStateData.internalBinaryWrite(message.gameState, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* repeated UserData users = 2; */
        for (let i = 0; i < message.users.length; i++)
            UserData.internalBinaryWrite(message.users[i], writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* repeated CharacterPositionData characterPositions = 3; */
        for (let i = 0; i < message.characterPositions.length; i++)
            CharacterPositionData.internalBinaryWrite(message.characterPositions[i], writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CGameStartNotification
 */
export const S2CGameStartNotification = new S2CGameStartNotification$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CPositionUpdateNotification$Type extends MessageType {
    constructor() {
        super("S2CPositionUpdateNotification", [
            { no: 1, name: "characterPositions", kind: "message", repeat: 2 /*RepeatType.UNPACKED*/, T: () => CharacterPositionData }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.characterPositions = [];
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated CharacterPositionData characterPositions */ 1:
                    message.characterPositions.push(CharacterPositionData.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* repeated CharacterPositionData characterPositions = 1; */
        for (let i = 0; i < message.characterPositions.length; i++)
            CharacterPositionData.internalBinaryWrite(message.characterPositions[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CPositionUpdateNotification
 */
export const S2CPositionUpdateNotification = new S2CPositionUpdateNotification$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CUseCardNotification$Type extends MessageType {
    constructor() {
        super("S2CUseCardNotification", [
            { no: 1, name: "cardType", kind: "enum", T: () => ["CardType", CardType] },
            { no: 2, name: "userId", kind: "scalar", T: 3 /*ScalarType.INT64*/ },
            { no: 3, name: "targetUserId", kind: "scalar", T: 3 /*ScalarType.INT64*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.cardType = 0;
        message.userId = "0";
        message.targetUserId = "0";
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* CardType cardType */ 1:
                    message.cardType = reader.int32();
                    break;
                case /* int64 userId */ 2:
                    message.userId = reader.int64().toString();
                    break;
                case /* int64 targetUserId */ 3:
                    message.targetUserId = reader.int64().toString();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* CardType cardType = 1; */
        if (message.cardType !== 0)
            writer.tag(1, WireType.Varint).int32(message.cardType);
        /* int64 userId = 2; */
        if (message.userId !== "0")
            writer.tag(2, WireType.Varint).int64(message.userId);
        /* int64 targetUserId = 3; */
        if (message.targetUserId !== "0")
            writer.tag(3, WireType.Varint).int64(message.targetUserId);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CUseCardNotification
 */
export const S2CUseCardNotification = new S2CUseCardNotification$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CEquipCardNotification$Type extends MessageType {
    constructor() {
        super("S2CEquipCardNotification", [
            { no: 1, name: "cardType", kind: "enum", T: () => ["CardType", CardType] },
            { no: 2, name: "userId", kind: "scalar", T: 3 /*ScalarType.INT64*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.cardType = 0;
        message.userId = "0";
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* CardType cardType */ 1:
                    message.cardType = reader.int32();
                    break;
                case /* int64 userId */ 2:
                    message.userId = reader.int64().toString();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* CardType cardType = 1; */
        if (message.cardType !== 0)
            writer.tag(1, WireType.Varint).int32(message.cardType);
        /* int64 userId = 2; */
        if (message.userId !== "0")
            writer.tag(2, WireType.Varint).int64(message.userId);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CEquipCardNotification
 */
export const S2CEquipCardNotification = new S2CEquipCardNotification$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CCardEffectNotification$Type extends MessageType {
    constructor() {
        super("S2CCardEffectNotification", [
            { no: 1, name: "cardType", kind: "enum", T: () => ["CardType", CardType] },
            { no: 2, name: "userId", kind: "scalar", T: 3 /*ScalarType.INT64*/ },
            { no: 3, name: "success", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.cardType = 0;
        message.userId = "0";
        message.success = false;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* CardType cardType */ 1:
                    message.cardType = reader.int32();
                    break;
                case /* int64 userId */ 2:
                    message.userId = reader.int64().toString();
                    break;
                case /* bool success */ 3:
                    message.success = reader.bool();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* CardType cardType = 1; */
        if (message.cardType !== 0)
            writer.tag(1, WireType.Varint).int32(message.cardType);
        /* int64 userId = 2; */
        if (message.userId !== "0")
            writer.tag(2, WireType.Varint).int64(message.userId);
        /* bool success = 3; */
        if (message.success !== false)
            writer.tag(3, WireType.Varint).bool(message.success);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CCardEffectNotification
 */
export const S2CCardEffectNotification = new S2CCardEffectNotification$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CFleaMarketNotification$Type extends MessageType {
    constructor() {
        super("S2CFleaMarketNotification", [
            { no: 1, name: "cardTypes", kind: "enum", repeat: 1 /*RepeatType.PACKED*/, T: () => ["CardType", CardType] },
            { no: 2, name: "pickIndex", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 5 /*ScalarType.INT32*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.cardTypes = [];
        message.pickIndex = [];
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated CardType cardTypes */ 1:
                    if (wireType === WireType.LengthDelimited)
                        for (let e = reader.int32() + reader.pos; reader.pos < e;)
                            message.cardTypes.push(reader.int32());
                    else
                        message.cardTypes.push(reader.int32());
                    break;
                case /* repeated int32 pickIndex */ 2:
                    if (wireType === WireType.LengthDelimited)
                        for (let e = reader.int32() + reader.pos; reader.pos < e;)
                            message.pickIndex.push(reader.int32());
                    else
                        message.pickIndex.push(reader.int32());
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* repeated CardType cardTypes = 1; */
        if (message.cardTypes.length) {
            writer.tag(1, WireType.LengthDelimited).fork();
            for (let i = 0; i < message.cardTypes.length; i++)
                writer.int32(message.cardTypes[i]);
            writer.join();
        }
        /* repeated int32 pickIndex = 2; */
        if (message.pickIndex.length) {
            writer.tag(2, WireType.LengthDelimited).fork();
            for (let i = 0; i < message.pickIndex.length; i++)
                writer.int32(message.pickIndex[i]);
            writer.join();
        }
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CFleaMarketNotification
 */
export const S2CFleaMarketNotification = new S2CFleaMarketNotification$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CUserUpdateNotification$Type extends MessageType {
    constructor() {
        super("S2CUserUpdateNotification", [
            { no: 1, name: "user", kind: "message", repeat: 2 /*RepeatType.UNPACKED*/, T: () => UserData }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.user = [];
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated UserData user */ 1:
                    message.user.push(UserData.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* repeated UserData user = 1; */
        for (let i = 0; i < message.user.length; i++)
            UserData.internalBinaryWrite(message.user[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CUserUpdateNotification
 */
export const S2CUserUpdateNotification = new S2CUserUpdateNotification$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CPhaseUpdateNotification$Type extends MessageType {
    constructor() {
        super("S2CPhaseUpdateNotification", [
            { no: 1, name: "phaseType", kind: "enum", T: () => ["PhaseType", PhaseType] },
            { no: 2, name: "nextPhaseAt", kind: "scalar", T: 3 /*ScalarType.INT64*/ },
            { no: 3, name: "characterPositions", kind: "message", repeat: 2 /*RepeatType.UNPACKED*/, T: () => CharacterPositionData }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.phaseType = 0;
        message.nextPhaseAt = "0";
        message.characterPositions = [];
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* PhaseType phaseType */ 1:
                    message.phaseType = reader.int32();
                    break;
                case /* int64 nextPhaseAt */ 2:
                    message.nextPhaseAt = reader.int64().toString();
                    break;
                case /* repeated CharacterPositionData characterPositions */ 3:
                    message.characterPositions.push(CharacterPositionData.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* PhaseType phaseType = 1; */
        if (message.phaseType !== 0)
            writer.tag(1, WireType.Varint).int32(message.phaseType);
        /* int64 nextPhaseAt = 2; */
        if (message.nextPhaseAt !== "0")
            writer.tag(2, WireType.Varint).int64(message.nextPhaseAt);
        /* repeated CharacterPositionData characterPositions = 3; */
        for (let i = 0; i < message.characterPositions.length; i++)
            CharacterPositionData.internalBinaryWrite(message.characterPositions[i], writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CPhaseUpdateNotification
 */
export const S2CPhaseUpdateNotification = new S2CPhaseUpdateNotification$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CGameEndNotification$Type extends MessageType {
    constructor() {
        super("S2CGameEndNotification", [
            { no: 1, name: "winners", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 3 /*ScalarType.INT64*/ },
            { no: 2, name: "winType", kind: "enum", T: () => ["WinType", WinType] }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.winners = [];
        message.winType = 0;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated int64 winners */ 1:
                    if (wireType === WireType.LengthDelimited)
                        for (let e = reader.int32() + reader.pos; reader.pos < e;)
                            message.winners.push(reader.int64().toString());
                    else
                        message.winners.push(reader.int64().toString());
                    break;
                case /* WinType winType */ 2:
                    message.winType = reader.int32();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* repeated int64 winners = 1; */
        if (message.winners.length) {
            writer.tag(1, WireType.LengthDelimited).fork();
            for (let i = 0; i < message.winners.length; i++)
                writer.int64(message.winners[i]);
            writer.join();
        }
        /* WinType winType = 2; */
        if (message.winType !== 0)
            writer.tag(2, WireType.Varint).int32(message.winType);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CGameEndNotification
 */
export const S2CGameEndNotification = new S2CGameEndNotification$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CWarningNotification$Type extends MessageType {
    constructor() {
        super("S2CWarningNotification", [
            { no: 1, name: "warningType", kind: "enum", T: () => ["WarningType", WarningType] },
            { no: 2, name: "expectedAt", kind: "scalar", T: 3 /*ScalarType.INT64*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.warningType = 0;
        message.expectedAt = "0";
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* WarningType warningType */ 1:
                    message.warningType = reader.int32();
                    break;
                case /* int64 expectedAt */ 2:
                    message.expectedAt = reader.int64().toString();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* WarningType warningType = 1; */
        if (message.warningType !== 0)
            writer.tag(1, WireType.Varint).int32(message.warningType);
        /* int64 expectedAt = 2; */
        if (message.expectedAt !== "0")
            writer.tag(2, WireType.Varint).int64(message.expectedAt);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CWarningNotification
 */
export const S2CWarningNotification = new S2CWarningNotification$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CAnimationNotification$Type extends MessageType {
    constructor() {
        super("S2CAnimationNotification", [
            { no: 1, name: "userId", kind: "scalar", T: 3 /*ScalarType.INT64*/ },
            { no: 2, name: "animationType", kind: "enum", T: () => ["AnimationType", AnimationType] }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.userId = "0";
        message.animationType = 0;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* int64 userId */ 1:
                    message.userId = reader.int64().toString();
                    break;
                case /* AnimationType animationType */ 2:
                    message.animationType = reader.int32();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* int64 userId = 1; */
        if (message.userId !== "0")
            writer.tag(1, WireType.Varint).int64(message.userId);
        /* AnimationType animationType = 2; */
        if (message.animationType !== 0)
            writer.tag(2, WireType.Varint).int32(message.animationType);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CAnimationNotification
 */
export const S2CAnimationNotification = new S2CAnimationNotification$Type();
