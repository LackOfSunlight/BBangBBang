import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { CharacterStateType } from "./enums";
import { PhaseType } from "./enums";
import { CardType } from "./enums";
import { RoleType } from "./enums";
import { CharacterType } from "./enums";
import { RoomStateType } from "./enums";
// @generated message type with reflection information, may provide speed optimized methods
class RoomData$Type extends MessageType {
    constructor() {
        super("RoomData", [
            { no: 1, name: "id", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 2, name: "ownerId", kind: "scalar", T: 3 /*ScalarType.INT64*/ },
            { no: 3, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "maxUserNum", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 5, name: "state", kind: "enum", T: () => ["RoomStateType", RoomStateType] },
            { no: 6, name: "users", kind: "message", repeat: 2 /*RepeatType.UNPACKED*/, T: () => UserData }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.id = 0;
        message.ownerId = "0";
        message.name = "";
        message.maxUserNum = 0;
        message.state = 0;
        message.users = [];
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* int32 id */ 1:
                    message.id = reader.int32();
                    break;
                case /* int64 ownerId */ 2:
                    message.ownerId = reader.int64().toString();
                    break;
                case /* string name */ 3:
                    message.name = reader.string();
                    break;
                case /* int32 maxUserNum */ 4:
                    message.maxUserNum = reader.int32();
                    break;
                case /* RoomStateType state */ 5:
                    message.state = reader.int32();
                    break;
                case /* repeated UserData users */ 6:
                    message.users.push(UserData.internalBinaryRead(reader, reader.uint32(), options));
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
        /* int32 id = 1; */
        if (message.id !== 0)
            writer.tag(1, WireType.Varint).int32(message.id);
        /* int64 ownerId = 2; */
        if (message.ownerId !== "0")
            writer.tag(2, WireType.Varint).int64(message.ownerId);
        /* string name = 3; */
        if (message.name !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.name);
        /* int32 maxUserNum = 4; */
        if (message.maxUserNum !== 0)
            writer.tag(4, WireType.Varint).int32(message.maxUserNum);
        /* RoomStateType state = 5; */
        if (message.state !== 0)
            writer.tag(5, WireType.Varint).int32(message.state);
        /* repeated UserData users = 6; */
        for (let i = 0; i < message.users.length; i++)
            UserData.internalBinaryWrite(message.users[i], writer.tag(6, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message RoomData
 */
export const RoomData = new RoomData$Type();
// @generated message type with reflection information, may provide speed optimized methods
class UserData$Type extends MessageType {
    constructor() {
        super("UserData", [
            { no: 1, name: "id", kind: "scalar", T: 3 /*ScalarType.INT64*/ },
            { no: 2, name: "nickname", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "character", kind: "message", T: () => CharacterData }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.id = "0";
        message.nickname = "";
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* int64 id */ 1:
                    message.id = reader.int64().toString();
                    break;
                case /* string nickname */ 2:
                    message.nickname = reader.string();
                    break;
                case /* CharacterData character */ 3:
                    message.character = CharacterData.internalBinaryRead(reader, reader.uint32(), options, message.character);
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
        /* int64 id = 1; */
        if (message.id !== "0")
            writer.tag(1, WireType.Varint).int64(message.id);
        /* string nickname = 2; */
        if (message.nickname !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.nickname);
        /* CharacterData character = 3; */
        if (message.character)
            CharacterData.internalBinaryWrite(message.character, writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message UserData
 */
export const UserData = new UserData$Type();
// @generated message type with reflection information, may provide speed optimized methods
class CharacterData$Type extends MessageType {
    constructor() {
        super("CharacterData", [
            { no: 1, name: "characterType", kind: "enum", T: () => ["CharacterType", CharacterType] },
            { no: 2, name: "roleType", kind: "enum", T: () => ["RoleType", RoleType] },
            { no: 3, name: "hp", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 4, name: "weapon", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 5, name: "stateInfo", kind: "message", T: () => CharacterStateInfoData },
            { no: 6, name: "equips", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 5 /*ScalarType.INT32*/ },
            { no: 7, name: "debuffs", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 5 /*ScalarType.INT32*/ },
            { no: 8, name: "handCards", kind: "message", repeat: 2 /*RepeatType.UNPACKED*/, T: () => CardData },
            { no: 9, name: "bbangCount", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 10, name: "handCardsCount", kind: "scalar", T: 5 /*ScalarType.INT32*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.characterType = 0;
        message.roleType = 0;
        message.hp = 0;
        message.weapon = 0;
        message.equips = [];
        message.debuffs = [];
        message.handCards = [];
        message.bbangCount = 0;
        message.handCardsCount = 0;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* CharacterType characterType */ 1:
                    message.characterType = reader.int32();
                    break;
                case /* RoleType roleType */ 2:
                    message.roleType = reader.int32();
                    break;
                case /* int32 hp */ 3:
                    message.hp = reader.int32();
                    break;
                case /* int32 weapon */ 4:
                    message.weapon = reader.int32();
                    break;
                case /* CharacterStateInfoData stateInfo */ 5:
                    message.stateInfo = CharacterStateInfoData.internalBinaryRead(reader, reader.uint32(), options, message.stateInfo);
                    break;
                case /* repeated int32 equips */ 6:
                    if (wireType === WireType.LengthDelimited)
                        for (let e = reader.int32() + reader.pos; reader.pos < e;)
                            message.equips.push(reader.int32());
                    else
                        message.equips.push(reader.int32());
                    break;
                case /* repeated int32 debuffs */ 7:
                    if (wireType === WireType.LengthDelimited)
                        for (let e = reader.int32() + reader.pos; reader.pos < e;)
                            message.debuffs.push(reader.int32());
                    else
                        message.debuffs.push(reader.int32());
                    break;
                case /* repeated CardData handCards */ 8:
                    message.handCards.push(CardData.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* int32 bbangCount */ 9:
                    message.bbangCount = reader.int32();
                    break;
                case /* int32 handCardsCount */ 10:
                    message.handCardsCount = reader.int32();
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
        /* CharacterType characterType = 1; */
        if (message.characterType !== 0)
            writer.tag(1, WireType.Varint).int32(message.characterType);
        /* RoleType roleType = 2; */
        if (message.roleType !== 0)
            writer.tag(2, WireType.Varint).int32(message.roleType);
        /* int32 hp = 3; */
        if (message.hp !== 0)
            writer.tag(3, WireType.Varint).int32(message.hp);
        /* int32 weapon = 4; */
        if (message.weapon !== 0)
            writer.tag(4, WireType.Varint).int32(message.weapon);
        /* CharacterStateInfoData stateInfo = 5; */
        if (message.stateInfo)
            CharacterStateInfoData.internalBinaryWrite(message.stateInfo, writer.tag(5, WireType.LengthDelimited).fork(), options).join();
        /* repeated int32 equips = 6; */
        if (message.equips.length) {
            writer.tag(6, WireType.LengthDelimited).fork();
            for (let i = 0; i < message.equips.length; i++)
                writer.int32(message.equips[i]);
            writer.join();
        }
        /* repeated int32 debuffs = 7; */
        if (message.debuffs.length) {
            writer.tag(7, WireType.LengthDelimited).fork();
            for (let i = 0; i < message.debuffs.length; i++)
                writer.int32(message.debuffs[i]);
            writer.join();
        }
        /* repeated CardData handCards = 8; */
        for (let i = 0; i < message.handCards.length; i++)
            CardData.internalBinaryWrite(message.handCards[i], writer.tag(8, WireType.LengthDelimited).fork(), options).join();
        /* int32 bbangCount = 9; */
        if (message.bbangCount !== 0)
            writer.tag(9, WireType.Varint).int32(message.bbangCount);
        /* int32 handCardsCount = 10; */
        if (message.handCardsCount !== 0)
            writer.tag(10, WireType.Varint).int32(message.handCardsCount);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message CharacterData
 */
export const CharacterData = new CharacterData$Type();
// @generated message type with reflection information, may provide speed optimized methods
class CharacterPositionData$Type extends MessageType {
    constructor() {
        super("CharacterPositionData", [
            { no: 1, name: "id", kind: "scalar", T: 3 /*ScalarType.INT64*/ },
            { no: 2, name: "x", kind: "scalar", T: 1 /*ScalarType.DOUBLE*/ },
            { no: 3, name: "y", kind: "scalar", T: 1 /*ScalarType.DOUBLE*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.id = "0";
        message.x = 0;
        message.y = 0;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* int64 id */ 1:
                    message.id = reader.int64().toString();
                    break;
                case /* double x */ 2:
                    message.x = reader.double();
                    break;
                case /* double y */ 3:
                    message.y = reader.double();
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
        /* int64 id = 1; */
        if (message.id !== "0")
            writer.tag(1, WireType.Varint).int64(message.id);
        /* double x = 2; */
        if (message.x !== 0)
            writer.tag(2, WireType.Bit64).double(message.x);
        /* double y = 3; */
        if (message.y !== 0)
            writer.tag(3, WireType.Bit64).double(message.y);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message CharacterPositionData
 */
export const CharacterPositionData = new CharacterPositionData$Type();
// @generated message type with reflection information, may provide speed optimized methods
class CardData$Type extends MessageType {
    constructor() {
        super("CardData", [
            { no: 1, name: "type", kind: "enum", T: () => ["CardType", CardType] },
            { no: 2, name: "count", kind: "scalar", T: 5 /*ScalarType.INT32*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.type = 0;
        message.count = 0;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* CardType type */ 1:
                    message.type = reader.int32();
                    break;
                case /* int32 count */ 2:
                    message.count = reader.int32();
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
        /* CardType type = 1; */
        if (message.type !== 0)
            writer.tag(1, WireType.Varint).int32(message.type);
        /* int32 count = 2; */
        if (message.count !== 0)
            writer.tag(2, WireType.Varint).int32(message.count);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message CardData
 */
export const CardData = new CardData$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GameStateData$Type extends MessageType {
    constructor() {
        super("GameStateData", [
            { no: 1, name: "phaseType", kind: "enum", T: () => ["PhaseType", PhaseType] },
            { no: 2, name: "nextPhaseAt", kind: "scalar", T: 3 /*ScalarType.INT64*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.phaseType = 0;
        message.nextPhaseAt = "0";
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
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message GameStateData
 */
export const GameStateData = new GameStateData$Type();
// @generated message type with reflection information, may provide speed optimized methods
class CharacterStateInfoData$Type extends MessageType {
    constructor() {
        super("CharacterStateInfoData", [
            { no: 1, name: "state", kind: "enum", T: () => ["CharacterStateType", CharacterStateType] },
            { no: 2, name: "nextState", kind: "enum", T: () => ["CharacterStateType", CharacterStateType] },
            { no: 3, name: "nextStateAt", kind: "scalar", T: 3 /*ScalarType.INT64*/ },
            { no: 4, name: "stateTargetUserId", kind: "scalar", T: 3 /*ScalarType.INT64*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.state = 0;
        message.nextState = 0;
        message.nextStateAt = "0";
        message.stateTargetUserId = "0";
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* CharacterStateType state */ 1:
                    message.state = reader.int32();
                    break;
                case /* CharacterStateType nextState */ 2:
                    message.nextState = reader.int32();
                    break;
                case /* int64 nextStateAt */ 3:
                    message.nextStateAt = reader.int64().toString();
                    break;
                case /* int64 stateTargetUserId */ 4:
                    message.stateTargetUserId = reader.int64().toString();
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
        /* CharacterStateType state = 1; */
        if (message.state !== 0)
            writer.tag(1, WireType.Varint).int32(message.state);
        /* CharacterStateType nextState = 2; */
        if (message.nextState !== 0)
            writer.tag(2, WireType.Varint).int32(message.nextState);
        /* int64 nextStateAt = 3; */
        if (message.nextStateAt !== "0")
            writer.tag(3, WireType.Varint).int64(message.nextStateAt);
        /* int64 stateTargetUserId = 4; */
        if (message.stateTargetUserId !== "0")
            writer.tag(4, WireType.Varint).int64(message.stateTargetUserId);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message CharacterStateInfoData
 */
export const CharacterStateInfoData = new CharacterStateInfoData$Type();
