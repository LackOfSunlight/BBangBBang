import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { GlobalFailCode } from "../common/enums";
import { RoomData } from "../common/types";
// @generated message type with reflection information, may provide speed optimized methods
class C2SCreateRoomRequest$Type extends MessageType {
    constructor() {
        super("C2SCreateRoomRequest", [
            { no: 1, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "maxUserNum", kind: "scalar", T: 5 /*ScalarType.INT32*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.name = "";
        message.maxUserNum = 0;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string name */ 1:
                    message.name = reader.string();
                    break;
                case /* int32 maxUserNum */ 2:
                    message.maxUserNum = reader.int32();
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
        /* string name = 1; */
        if (message.name !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.name);
        /* int32 maxUserNum = 2; */
        if (message.maxUserNum !== 0)
            writer.tag(2, WireType.Varint).int32(message.maxUserNum);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message C2SCreateRoomRequest
 */
export const C2SCreateRoomRequest = new C2SCreateRoomRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CCreateRoomResponse$Type extends MessageType {
    constructor() {
        super("S2CCreateRoomResponse", [
            { no: 1, name: "success", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 2, name: "room", kind: "message", T: () => RoomData },
            { no: 3, name: "failCode", kind: "enum", T: () => ["GlobalFailCode", GlobalFailCode] }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.success = false;
        message.failCode = 0;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bool success */ 1:
                    message.success = reader.bool();
                    break;
                case /* RoomData room */ 2:
                    message.room = RoomData.internalBinaryRead(reader, reader.uint32(), options, message.room);
                    break;
                case /* GlobalFailCode failCode */ 3:
                    message.failCode = reader.int32();
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
        /* bool success = 1; */
        if (message.success !== false)
            writer.tag(1, WireType.Varint).bool(message.success);
        /* RoomData room = 2; */
        if (message.room)
            RoomData.internalBinaryWrite(message.room, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* GlobalFailCode failCode = 3; */
        if (message.failCode !== 0)
            writer.tag(3, WireType.Varint).int32(message.failCode);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CCreateRoomResponse
 */
export const S2CCreateRoomResponse = new S2CCreateRoomResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class C2SGetRoomListRequest$Type extends MessageType {
    constructor() {
        super("C2SGetRoomListRequest", []);
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
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message C2SGetRoomListRequest
 */
export const C2SGetRoomListRequest = new C2SGetRoomListRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CGetRoomListResponse$Type extends MessageType {
    constructor() {
        super("S2CGetRoomListResponse", [
            { no: 1, name: "rooms", kind: "message", repeat: 2 /*RepeatType.UNPACKED*/, T: () => RoomData }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.rooms = [];
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated RoomData rooms */ 1:
                    message.rooms.push(RoomData.internalBinaryRead(reader, reader.uint32(), options));
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
        /* repeated RoomData rooms = 1; */
        for (let i = 0; i < message.rooms.length; i++)
            RoomData.internalBinaryWrite(message.rooms[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CGetRoomListResponse
 */
export const S2CGetRoomListResponse = new S2CGetRoomListResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class C2SJoinRoomRequest$Type extends MessageType {
    constructor() {
        super("C2SJoinRoomRequest", [
            { no: 1, name: "roomId", kind: "scalar", T: 5 /*ScalarType.INT32*/ }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.roomId = 0;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* int32 roomId */ 1:
                    message.roomId = reader.int32();
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
        /* int32 roomId = 1; */
        if (message.roomId !== 0)
            writer.tag(1, WireType.Varint).int32(message.roomId);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message C2SJoinRoomRequest
 */
export const C2SJoinRoomRequest = new C2SJoinRoomRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CJoinRoomResponse$Type extends MessageType {
    constructor() {
        super("S2CJoinRoomResponse", [
            { no: 1, name: "success", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 2, name: "room", kind: "message", T: () => RoomData },
            { no: 3, name: "failCode", kind: "enum", T: () => ["GlobalFailCode", GlobalFailCode] }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.success = false;
        message.failCode = 0;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bool success */ 1:
                    message.success = reader.bool();
                    break;
                case /* RoomData room */ 2:
                    message.room = RoomData.internalBinaryRead(reader, reader.uint32(), options, message.room);
                    break;
                case /* GlobalFailCode failCode */ 3:
                    message.failCode = reader.int32();
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
        /* bool success = 1; */
        if (message.success !== false)
            writer.tag(1, WireType.Varint).bool(message.success);
        /* RoomData room = 2; */
        if (message.room)
            RoomData.internalBinaryWrite(message.room, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* GlobalFailCode failCode = 3; */
        if (message.failCode !== 0)
            writer.tag(3, WireType.Varint).int32(message.failCode);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CJoinRoomResponse
 */
export const S2CJoinRoomResponse = new S2CJoinRoomResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class C2SJoinRandomRoomRequest$Type extends MessageType {
    constructor() {
        super("C2SJoinRandomRoomRequest", []);
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
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message C2SJoinRandomRoomRequest
 */
export const C2SJoinRandomRoomRequest = new C2SJoinRandomRoomRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CJoinRandomRoomResponse$Type extends MessageType {
    constructor() {
        super("S2CJoinRandomRoomResponse", [
            { no: 1, name: "success", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 2, name: "room", kind: "message", T: () => RoomData },
            { no: 3, name: "failCode", kind: "enum", T: () => ["GlobalFailCode", GlobalFailCode] }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.success = false;
        message.failCode = 0;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bool success */ 1:
                    message.success = reader.bool();
                    break;
                case /* RoomData room */ 2:
                    message.room = RoomData.internalBinaryRead(reader, reader.uint32(), options, message.room);
                    break;
                case /* GlobalFailCode failCode */ 3:
                    message.failCode = reader.int32();
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
        /* bool success = 1; */
        if (message.success !== false)
            writer.tag(1, WireType.Varint).bool(message.success);
        /* RoomData room = 2; */
        if (message.room)
            RoomData.internalBinaryWrite(message.room, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* GlobalFailCode failCode = 3; */
        if (message.failCode !== 0)
            writer.tag(3, WireType.Varint).int32(message.failCode);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CJoinRandomRoomResponse
 */
export const S2CJoinRandomRoomResponse = new S2CJoinRandomRoomResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class C2SLeaveRoomRequest$Type extends MessageType {
    constructor() {
        super("C2SLeaveRoomRequest", []);
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
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message C2SLeaveRoomRequest
 */
export const C2SLeaveRoomRequest = new C2SLeaveRoomRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class S2CLeaveRoomResponse$Type extends MessageType {
    constructor() {
        super("S2CLeaveRoomResponse", [
            { no: 1, name: "success", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 2, name: "failCode", kind: "enum", T: () => ["GlobalFailCode", GlobalFailCode] }
        ]);
    }
    create(value) {
        const message = globalThis.Object.create((this.messagePrototype));
        message.success = false;
        message.failCode = 0;
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bool success */ 1:
                    message.success = reader.bool();
                    break;
                case /* GlobalFailCode failCode */ 2:
                    message.failCode = reader.int32();
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
        /* bool success = 1; */
        if (message.success !== false)
            writer.tag(1, WireType.Varint).bool(message.success);
        /* GlobalFailCode failCode = 2; */
        if (message.failCode !== 0)
            writer.tag(2, WireType.Varint).int32(message.failCode);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message S2CLeaveRoomResponse
 */
export const S2CLeaveRoomResponse = new S2CLeaveRoomResponse$Type();
