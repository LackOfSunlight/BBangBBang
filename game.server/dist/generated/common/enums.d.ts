/**
 *
 * 실패 코드
 *
 * @generated from protobuf enum GlobalFailCode
 */
export declare enum GlobalFailCode {
    /**
     * @generated from protobuf enum value: NONE_FAILCODE = 0;
     */
    NONE_FAILCODE = 0,
    /**
     * @generated from protobuf enum value: UNKNOWN_ERROR = 1;
     */
    UNKNOWN_ERROR = 1,
    /**
     * @generated from protobuf enum value: INVALID_REQUEST = 2;
     */
    INVALID_REQUEST = 2,
    /**
     * @generated from protobuf enum value: AUTHENTICATION_FAILED = 3;
     */
    AUTHENTICATION_FAILED = 3,
    /**
     * @generated from protobuf enum value: CREATE_ROOM_FAILED = 4;
     */
    CREATE_ROOM_FAILED = 4,
    /**
     * @generated from protobuf enum value: JOIN_ROOM_FAILED = 5;
     */
    JOIN_ROOM_FAILED = 5,
    /**
     * @generated from protobuf enum value: LEAVE_ROOM_FAILED = 6;
     */
    LEAVE_ROOM_FAILED = 6,
    /**
     * @generated from protobuf enum value: REGISTER_FAILED = 7;
     */
    REGISTER_FAILED = 7,
    /**
     * @generated from protobuf enum value: ROOM_NOT_FOUND = 8;
     */
    ROOM_NOT_FOUND = 8,
    /**
     * @generated from protobuf enum value: CHARACTER_NOT_FOUND = 9;
     */
    CHARACTER_NOT_FOUND = 9,
    /**
     * @generated from protobuf enum value: CHARACTER_STATE_ERROR = 10;
     */
    CHARACTER_STATE_ERROR = 10,
    /**
     * @generated from protobuf enum value: CHARACTER_NO_CARD = 11;
     */
    CHARACTER_NO_CARD = 11,
    /**
     * @generated from protobuf enum value: INVALID_ROOM_STATE = 12;
     */
    INVALID_ROOM_STATE = 12,
    /**
     * @generated from protobuf enum value: NOT_ROOM_OWNER = 13;
     */
    NOT_ROOM_OWNER = 13,
    /**
     * @generated from protobuf enum value: ALREADY_USED_BBANG = 14;
     */
    ALREADY_USED_BBANG = 14,
    /**
     * @generated from protobuf enum value: INVALID_PHASE = 15;
     */
    INVALID_PHASE = 15,
    /**
     * @generated from protobuf enum value: CHARACTER_CONTAINED = 16;
     */
    CHARACTER_CONTAINED = 16
}
/**
 * @generated from protobuf enum WarningType
 */
export declare enum WarningType {
    /**
     * @generated from protobuf enum value: NO_WARNING = 0;
     */
    NO_WARNING = 0,
    /**
     * @generated from protobuf enum value: BOMB_WANING = 1;
     */
    BOMB_WANING = 1
}
/**
 * @generated from protobuf enum WinType
 */
export declare enum WinType {
    /**
     * @generated from protobuf enum value: TARGET_AND_BODYGUARD_WIN = 0;
     */
    TARGET_AND_BODYGUARD_WIN = 0,
    /**
     * @generated from protobuf enum value: HITMAN_WIN = 1;
     */
    HITMAN_WIN = 1,
    /**
     * @generated from protobuf enum value: PSYCHOPATH_WIN = 2;
     */
    PSYCHOPATH_WIN = 2
}
/**
 * @generated from protobuf enum CharacterType
 */
export declare enum CharacterType {
    /**
     * @generated from protobuf enum value: NONE_CHARACTER = 0;
     */
    NONE_CHARACTER = 0,
    /**
     * 빨강이
     *
     * @generated from protobuf enum value: RED = 1;
     */
    RED = 1,
    /**
     * 상어군
     *
     * @generated from protobuf enum value: SHARK = 3;
     */
    SHARK = 3,
    /**
     * 말랑이
     *
     * @generated from protobuf enum value: MALANG = 5;
     */
    MALANG = 5,
    /**
     * 개굴군
     *
     * @generated from protobuf enum value: FROGGY = 7;
     */
    FROGGY = 7,
    /**
     * 핑크군
     *
     * @generated from protobuf enum value: PINK = 8;
     */
    PINK = 8,
    /**
     * 물안경군
     *
     * @generated from protobuf enum value: SWIM_GLASSES = 9;
     */
    SWIM_GLASSES = 9,
    /**
     * 가면군
     *
     * @generated from protobuf enum value: MASK = 10;
     */
    MASK = 10,
    /**
     * 공룡이
     *
     * @generated from protobuf enum value: DINOSAUR = 12;
     */
    DINOSAUR = 12,
    /**
     * 핑크슬라임
     *
     * @generated from protobuf enum value: PINK_SLIME = 13;
     */
    PINK_SLIME = 13
}
/**
 * @generated from protobuf enum CharacterStateType
 */
export declare enum CharacterStateType {
    /**
     * @generated from protobuf enum value: NONE_CHARACTER_STATE = 0;
     */
    NONE_CHARACTER_STATE = 0,
    /**
     * 빵야 시전자
     *
     * @generated from protobuf enum value: BBANG_SHOOTER = 1;
     */
    BBANG_SHOOTER = 1,
    /**
     * 빵야 대상 (쉴드 사용가능 상태)
     *
     * @generated from protobuf enum value: BBANG_TARGET = 2;
     */
    BBANG_TARGET = 2,
    /**
     * 현피 중 자신의 턴이 아닐 때
     *
     * @generated from protobuf enum value: DEATH_MATCH_STATE = 3;
     */
    DEATH_MATCH_STATE = 3,
    /**
     * 현피 중 자신의 턴
     *
     * @generated from protobuf enum value: DEATH_MATCH_TURN_STATE = 4;
     */
    DEATH_MATCH_TURN_STATE = 4,
    /**
     * 플리마켓 자신의 턴
     *
     * @generated from protobuf enum value: FLEA_MARKET_TURN = 5;
     */
    FLEA_MARKET_TURN = 5,
    /**
     * 플리마켓 턴 대기 상태
     *
     * @generated from protobuf enum value: FLEA_MARKET_WAIT = 6;
     */
    FLEA_MARKET_WAIT = 6,
    /**
     * 게릴라 시전자
     *
     * @generated from protobuf enum value: GUERRILLA_SHOOTER = 7;
     */
    GUERRILLA_SHOOTER = 7,
    /**
     * 게릴라 대상
     *
     * @generated from protobuf enum value: GUERRILLA_TARGET = 8;
     */
    GUERRILLA_TARGET = 8,
    /**
     * 난사 시전자
     *
     * @generated from protobuf enum value: BIG_BBANG_SHOOTER = 9;
     */
    BIG_BBANG_SHOOTER = 9,
    /**
     * 난사 대상
     *
     * @generated from protobuf enum value: BIG_BBANG_TARGET = 10;
     */
    BIG_BBANG_TARGET = 10,
    /**
     * 흡수 중
     *
     * @generated from protobuf enum value: ABSORBING = 11;
     */
    ABSORBING = 11,
    /**
     * 흡수 대상
     *
     * @generated from protobuf enum value: ABSORB_TARGET = 12;
     */
    ABSORB_TARGET = 12,
    /**
     * 신기루 중
     *
     * @generated from protobuf enum value: HALLUCINATING = 13;
     */
    HALLUCINATING = 13,
    /**
     * 신기루 대상
     *
     * @generated from protobuf enum value: HALLUCINATION_TARGET = 14;
     */
    HALLUCINATION_TARGET = 14,
    /**
     * 감금 중
     *
     * @generated from protobuf enum value: CONTAINED = 15;
     */
    CONTAINED = 15
}
/**
 * @generated from protobuf enum CardType
 */
export declare enum CardType {
    /**
     * @generated from protobuf enum value: NONE = 0;
     */
    NONE = 0,
    /**
     * 20장
     *
     * @generated from protobuf enum value: BBANG = 1;
     */
    BBANG = 1,
    /**
     * 1장
     *
     * @generated from protobuf enum value: BIG_BBANG = 2;
     */
    BIG_BBANG = 2,
    /**
     * 10장
     *
     * @generated from protobuf enum value: SHIELD = 3;
     */
    SHIELD = 3,
    /**
     * 6장
     *
     * @generated from protobuf enum value: VACCINE = 4;
     */
    VACCINE = 4,
    /**
     * 2장
     *
     * @generated from protobuf enum value: CALL_119 = 5;
     */
    CALL_119 = 5,
    /**
     * 4장
     *
     * @generated from protobuf enum value: DEATH_MATCH = 6;
     */
    DEATH_MATCH = 6,
    /**
     * 1장
     *
     * @generated from protobuf enum value: GUERRILLA = 7;
     */
    GUERRILLA = 7,
    /**
     * 4장
     *
     * @generated from protobuf enum value: ABSORB = 8;
     */
    ABSORB = 8,
    /**
     * 4장
     *
     * @generated from protobuf enum value: HALLUCINATION = 9;
     */
    HALLUCINATION = 9,
    /**
     * 3장
     *
     * @generated from protobuf enum value: FLEA_MARKET = 10;
     */
    FLEA_MARKET = 10,
    /**
     * 2장
     *
     * @generated from protobuf enum value: MATURED_SAVINGS = 11;
     */
    MATURED_SAVINGS = 11,
    /**
     * 1장
     *
     * @generated from protobuf enum value: WIN_LOTTERY = 12;
     */
    WIN_LOTTERY = 12,
    /**
     * 1장
     *
     * @generated from protobuf enum value: SNIPER_GUN = 13;
     */
    SNIPER_GUN = 13,
    /**
     * 2장
     *
     * @generated from protobuf enum value: HAND_GUN = 14;
     */
    HAND_GUN = 14,
    /**
     * 3장
     *
     * @generated from protobuf enum value: DESERT_EAGLE = 15;
     */
    DESERT_EAGLE = 15,
    /**
     * 2장
     *
     * @generated from protobuf enum value: AUTO_RIFLE = 16;
     */
    AUTO_RIFLE = 16,
    /**
     * 1장
     *
     * @generated from protobuf enum value: LASER_POINTER = 17;
     */
    LASER_POINTER = 17,
    /**
     * 1장
     *
     * @generated from protobuf enum value: RADAR = 18;
     */
    RADAR = 18,
    /**
     * 2장
     *
     * @generated from protobuf enum value: AUTO_SHIELD = 19;
     */
    AUTO_SHIELD = 19,
    /**
     * 2장
     *
     * @generated from protobuf enum value: STEALTH_SUIT = 20;
     */
    STEALTH_SUIT = 20,
    /**
     * 3장
     *
     * @generated from protobuf enum value: CONTAINMENT_UNIT = 21;
     */
    CONTAINMENT_UNIT = 21,
    /**
     * 1장
     *
     * @generated from protobuf enum value: SATELLITE_TARGET = 22;
     */
    SATELLITE_TARGET = 22,
    /**
     * 1장
     *
     * @generated from protobuf enum value: BOMB = 23;
     */
    BOMB = 23
}
/**
 * @generated from protobuf enum RoleType
 */
export declare enum RoleType {
    /**
     * @generated from protobuf enum value: NONE_ROLE = 0;
     */
    NONE_ROLE = 0,
    /**
     * @generated from protobuf enum value: TARGET = 1;
     */
    TARGET = 1,
    /**
     * @generated from protobuf enum value: BODYGUARD = 2;
     */
    BODYGUARD = 2,
    /**
     * @generated from protobuf enum value: HITMAN = 3;
     */
    HITMAN = 3,
    /**
     * @generated from protobuf enum value: PSYCHOPATH = 4;
     */
    PSYCHOPATH = 4
}
/**
 * @generated from protobuf enum RoomStateType
 */
export declare enum RoomStateType {
    /**
     * @generated from protobuf enum value: WAIT = 0;
     */
    WAIT = 0,
    /**
     * @generated from protobuf enum value: PREPARE = 1;
     */
    PREPARE = 1,
    /**
     * @generated from protobuf enum value: INGAME = 2;
     */
    INGAME = 2
}
/**
 * @generated from protobuf enum PhaseType
 */
export declare enum PhaseType {
    /**
     * @generated from protobuf enum value: NONE_PHASE = 0;
     */
    NONE_PHASE = 0,
    /**
     * @generated from protobuf enum value: DAY = 1;
     */
    DAY = 1,
    /**
     * @generated from protobuf enum value: EVENING = 2;
     */
    EVENING = 2,
    /**
     * @generated from protobuf enum value: END = 3;
     */
    END = 3
}
/**
 * @generated from protobuf enum ReactionType
 */
export declare enum ReactionType {
    /**
     * @generated from protobuf enum value: NONE_REACTION = 0;
     */
    NONE_REACTION = 0,
    /**
     * @generated from protobuf enum value: NOT_USE_CARD = 1;
     */
    NOT_USE_CARD = 1
}
/**
 * @generated from protobuf enum SelectCardType
 */
export declare enum SelectCardType {
    /**
     * @generated from protobuf enum value: HAND = 0;
     */
    HAND = 0,
    /**
     * @generated from protobuf enum value: EQUIP = 1;
     */
    EQUIP = 1,
    /**
     * @generated from protobuf enum value: WEAPON = 2;
     */
    WEAPON = 2,
    /**
     * @generated from protobuf enum value: DEBUFF = 3;
     */
    DEBUFF = 3
}
/**
 * @generated from protobuf enum AnimationType
 */
export declare enum AnimationType {
    /**
     * @generated from protobuf enum value: NO_ANIMATION = 0;
     */
    NO_ANIMATION = 0,
    /**
     * @generated from protobuf enum value: SATELLITE_TARGET_ANIMATION = 1;
     */
    SATELLITE_TARGET_ANIMATION = 1,
    /**
     * @generated from protobuf enum value: BOMB_ANIMATION = 2;
     */
    BOMB_ANIMATION = 2,
    /**
     * @generated from protobuf enum value: SHIELD_ANIMATION = 3;
     */
    SHIELD_ANIMATION = 3
}
//# sourceMappingURL=enums.d.ts.map