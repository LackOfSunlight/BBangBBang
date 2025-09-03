import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { CharacterStateType } from "./enums";
import { PhaseType } from "./enums";
import { CardType } from "./enums";
import { RoleType } from "./enums";
import { CharacterType } from "./enums";
import { RoomStateType } from "./enums";
/**
 *
 * 게임 데이터 명세
 *
 * @generated from protobuf message RoomData
 */
export interface RoomData {
    /**
     * @generated from protobuf field: int32 id = 1
     */
    id: number;
    /**
     * @generated from protobuf field: int64 ownerId = 2
     */
    ownerId: string;
    /**
     * @generated from protobuf field: string name = 3
     */
    name: string;
    /**
     * @generated from protobuf field: int32 maxUserNum = 4
     */
    maxUserNum: number;
    /**
     * @generated from protobuf field: RoomStateType state = 5
     */
    state: RoomStateType;
    /**
     * @generated from protobuf field: repeated UserData users = 6
     */
    users: UserData[];
}
/**
 * 입장했을 때는 랜덤으로 체력만큼 카드 받음.
 * 하루 종료 시 체력만큼의 카드만 남길 수 있음.
 * 이후 낮이 될 때마다 카드를 두 장 받고 시작함.
 *
 * @generated from protobuf message UserData
 */
export interface UserData {
    /**
     * @generated from protobuf field: int64 id = 1
     */
    id: string;
    /**
     * @generated from protobuf field: string nickname = 2
     */
    nickname: string;
    /**
     * @generated from protobuf field: CharacterData character = 3
     */
    character?: CharacterData;
}
/**
 * @generated from protobuf message CharacterData
 */
export interface CharacterData {
    /**
     * @generated from protobuf field: CharacterType characterType = 1
     */
    characterType: CharacterType;
    /**
     * @generated from protobuf field: RoleType roleType = 2
     */
    roleType: RoleType;
    /**
     * @generated from protobuf field: int32 hp = 3
     */
    hp: number;
    /**
     * @generated from protobuf field: int32 weapon = 4
     */
    weapon: number;
    /**
     * @generated from protobuf field: CharacterStateInfoData stateInfo = 5
     */
    stateInfo?: CharacterStateInfoData;
    /**
     * @generated from protobuf field: repeated int32 equips = 6
     */
    equips: number[];
    /**
     * @generated from protobuf field: repeated int32 debuffs = 7
     */
    debuffs: number[];
    /**
     * @generated from protobuf field: repeated CardData handCards = 8
     */
    handCards: CardData[];
    /**
     * @generated from protobuf field: int32 bbangCount = 9
     */
    bbangCount: number;
    /**
     * @generated from protobuf field: int32 handCardsCount = 10
     */
    handCardsCount: number;
}
/**
 * @generated from protobuf message CharacterPositionData
 */
export interface CharacterPositionData {
    /**
     * @generated from protobuf field: int64 id = 1
     */
    id: string;
    /**
     * @generated from protobuf field: double x = 2
     */
    x: number;
    /**
     * @generated from protobuf field: double y = 3
     */
    y: number;
}
/**
 * @generated from protobuf message CardData
 */
export interface CardData {
    /**
     * @generated from protobuf field: CardType type = 1
     */
    type: CardType;
    /**
     * @generated from protobuf field: int32 count = 2
     */
    count: number;
}
/**
 * @generated from protobuf message GameStateData
 */
export interface GameStateData {
    /**
     * @generated from protobuf field: PhaseType phaseType = 1
     */
    phaseType: PhaseType;
    /**
     * @generated from protobuf field: int64 nextPhaseAt = 2
     */
    nextPhaseAt: string;
}
/**
 * @generated from protobuf message CharacterStateInfoData
 */
export interface CharacterStateInfoData {
    /**
     * @generated from protobuf field: CharacterStateType state = 1
     */
    state: CharacterStateType;
    /**
     * @generated from protobuf field: CharacterStateType nextState = 2
     */
    nextState: CharacterStateType;
    /**
     * @generated from protobuf field: int64 nextStateAt = 3
     */
    nextStateAt: string;
    /**
     * @generated from protobuf field: int64 stateTargetUserId = 4
     */
    stateTargetUserId: string;
}
declare class RoomData$Type extends MessageType<RoomData> {
    constructor();
    create(value?: PartialMessage<RoomData>): RoomData;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: RoomData): RoomData;
    internalBinaryWrite(message: RoomData, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message RoomData
 */
export declare const RoomData: RoomData$Type;
declare class UserData$Type extends MessageType<UserData> {
    constructor();
    create(value?: PartialMessage<UserData>): UserData;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: UserData): UserData;
    internalBinaryWrite(message: UserData, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message UserData
 */
export declare const UserData: UserData$Type;
declare class CharacterData$Type extends MessageType<CharacterData> {
    constructor();
    create(value?: PartialMessage<CharacterData>): CharacterData;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: CharacterData): CharacterData;
    internalBinaryWrite(message: CharacterData, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message CharacterData
 */
export declare const CharacterData: CharacterData$Type;
declare class CharacterPositionData$Type extends MessageType<CharacterPositionData> {
    constructor();
    create(value?: PartialMessage<CharacterPositionData>): CharacterPositionData;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: CharacterPositionData): CharacterPositionData;
    internalBinaryWrite(message: CharacterPositionData, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message CharacterPositionData
 */
export declare const CharacterPositionData: CharacterPositionData$Type;
declare class CardData$Type extends MessageType<CardData> {
    constructor();
    create(value?: PartialMessage<CardData>): CardData;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: CardData): CardData;
    internalBinaryWrite(message: CardData, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message CardData
 */
export declare const CardData: CardData$Type;
declare class GameStateData$Type extends MessageType<GameStateData> {
    constructor();
    create(value?: PartialMessage<GameStateData>): GameStateData;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GameStateData): GameStateData;
    internalBinaryWrite(message: GameStateData, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message GameStateData
 */
export declare const GameStateData: GameStateData$Type;
declare class CharacterStateInfoData$Type extends MessageType<CharacterStateInfoData> {
    constructor();
    create(value?: PartialMessage<CharacterStateInfoData>): CharacterStateInfoData;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: CharacterStateInfoData): CharacterStateInfoData;
    internalBinaryWrite(message: CharacterStateInfoData, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message CharacterStateInfoData
 */
export declare const CharacterStateInfoData: CharacterStateInfoData$Type;
export {};
//# sourceMappingURL=types.d.ts.map