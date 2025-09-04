// game.server/src/enums/gamePacketType.ts
export var GamePacketType;
(function (GamePacketType) {
    GamePacketType["registerRequest"] = "registerRequest";
    GamePacketType["registerResponse"] = "registerResponse";
    GamePacketType["loginRequest"] = "loginRequest";
    GamePacketType["loginResponse"] = "loginResponse";
    // 방 생성
    GamePacketType["createRoomRequest"] = "createRoomRequest";
    GamePacketType["createRoomResponse"] = "createRoomResponse";
    // 방 목록 조회
    GamePacketType["getRoomListRequest"] = "getRoomListRequest";
    GamePacketType["getRoomListResponse"] = "getRoomListResponse";
    // 방 참가
    GamePacketType["joinRoomRequest"] = "joinRoomRequest";
    GamePacketType["joinRoomResponse"] = "joinRoomResponse";
    // 랜덤 방 참가
    GamePacketType["joinRandomRoomRequest"] = "joinRandomRoomRequest";
    GamePacketType["joinRandomRoomResponse"] = "joinRandomRoomResponse";
    // 방 참가 알림
    GamePacketType["joinRoomNotification"] = "joinRoomNotification";
    // 방 나가기
    GamePacketType["leaveRoomRequest"] = "leaveRoomRequest";
    GamePacketType["leaveRoomResponse"] = "leaveRoomResponse";
    // 방 나가기 알림
    GamePacketType["leaveRoomNotification"] = "leaveRoomNotification";
    // 게임 시작 전 역할 및 캐릭터 셔플 요청
    GamePacketType["gamePrepareRequest"] = "gamePrepareRequest";
    GamePacketType["gamePrepareResponse"] = "gamePrepareResponse";
    GamePacketType["gamePrepareNotification"] = "gamePrepareNotification";
    // 게임 시작
    GamePacketType["gameStartRequest"] = "gameStartRequest";
    GamePacketType["gameStartResponse"] = "gameStartResponse";
    GamePacketType["gameStartNotification"] = "gameStartNotification";
    // 위치 업데이트
    GamePacketType["positionUpdateRequest"] = "positionUpdateRequest";
    GamePacketType["positionUpdateNotification"] = "positionUpdateNotification";
    // 카드 사용
    GamePacketType["useCardRequest"] = "useCardRequest";
    GamePacketType["useCardResponse"] = "useCardResponse";
    // 카드 효과 알림
    GamePacketType["useCardNotification"] = "useCardNotification";
    GamePacketType["equipCardNotification"] = "equipCardNotification";
    GamePacketType["cardEffectNotification"] = "cardEffectNotification";
    // 플리마켓
    GamePacketType["fleaMarketNotification"] = "fleaMarketNotification";
    GamePacketType["fleaMarketPickRequest"] = "fleaMarketPickRequest";
    GamePacketType["fleaMarketPickResponse"] = "fleaMarketPickResponse";
    // 카드 사용 등으로 인한 유저 정보 업데이트
    GamePacketType["userUpdateNotification"] = "userUpdateNotification";
    // 페이즈 업데이트
    GamePacketType["phaseUpdateNotification"] = "phaseUpdateNotification";
    // 리액션
    GamePacketType["reactionRequest"] = "reactionRequest";
    GamePacketType["reactionResponse"] = "reactionResponse";
    // 턴 종료시 (phaseType 3) 카드 버리기
    GamePacketType["destroyCardRequest"] = "destroyCardRequest";
    GamePacketType["destroyCardResponse"] = "destroyCardResponse";
    // 게임 종료
    GamePacketType["gameEndNotification"] = "gameEndNotification";
    // 카드 선택
    GamePacketType["cardSelectRequest"] = "cardSelectRequest";
    GamePacketType["cardSelectResponse"] = "cardSelectResponse";
    // 디버프 넘기기
    GamePacketType["passDebuffRequest"] = "passDebuffRequest";
    GamePacketType["passDebuffResponse"] = "passDebuffResponse";
    GamePacketType["warningNotification"] = "warningNotification";
    // 효과 알림
    GamePacketType["animationNotification"] = "animationNotification";
})(GamePacketType || (GamePacketType = {}));
// game.server/src/enums/gamePacketType.ts
export const gamePackType = {
    registerRequest: "registerRequest",
    registerResponse: "registerResponse",
    loginRequest: "loginRequest",
    loginResponse: "loginResponse",
    // 방 생성
    createRoomRequest: "createRoomRequest",
    createRoomResponse: "createRoomResponse",
    // 방 목록 조회
    getRoomListRequest: "getRoomListRequest",
    getRoomListResponse: "getRoomListResponse",
    // 방 참가
    joinRoomRequest: "joinRoomRequest",
    joinRoomResponse: "joinRoomResponse",
    // 랜덤 방 참가
    joinRandomRoomRequest: "joinRandomRoomRequest",
    joinRandomRoomResponse: "joinRandomRoomResponse",
    // 방 참가 알림
    joinRoomNotification: "joinRoomNotification",
    // 방 나가기
    leaveRoomRequest: "leaveRoomRequest",
    leaveRoomResponse: "leaveRoomResponse",
    // 방 나가기 알림
    leaveRoomNotification: "leaveRoomNotification",
    // 게임 시작 전 역할 및 캐릭터 셔플 요청
    gamePrepareRequest: "gamePrepareRequest",
    gamePrepareResponse: "gamePrepareResponse",
    gamePrepareNotification: "gamePrepareNotification",
    // 게임 시작
    gameStartRequest: "gameStartRequest",
    gameStartResponse: "gameStartResponse",
    gameStartNotification: "gameStartNotification",
    // 위치 업데이트
    positionUpdateRequest: "positionUpdateRequest",
    positionUpdateNotification: "positionUpdateNotification",
    // 카드 사용
    useCardRequest: "useCardRequest",
    useCardResponse: "useCardResponse",
    // 카드 효과 알림
    useCardNotification: "useCardNotification",
    equipCardNotification: "equipCardNotification",
    cardEffectNotification: "cardEffectNotification",
    // 플리마켓
    fleaMarketNotification: "fleaMarketNotification",
    fleaMarketPickRequest: "fleaMarketPickRequest",
    fleaMarketPickResponse: "fleaMarketPickResponse",
    // 카드 사용 등으로 인한 유저 정보 업데이트
    userUpdateNotification: "userUpdateNotification",
    // 페이즈 업데이트
    phaseUpdateNotification: "phaseUpdateNotification",
    // 리액션
    reactionRequest: "reactionRequest",
    reactionResponse: "reactionResponse",
    // 턴 종료시 (phaseType 3) 카드 버리기
    destroyCardRequest: "destroyCardRequest",
    destroyCardResponse: "destroyCardResponse",
    // 게임 종료
    gameEndNotification: "gameEndNotification",
    // 카드 선택
    cardSelectRequest: "cardSelectRequest",
    cardSelectResponse: "cardSelectResponse",
    // 디버프 넘기기
    passDebuffRequest: "passDebuffRequest",
    passDebuffResponse: "passDebuffResponse",
    warningNotification: "warningNotification",
    // 효과 알림
    animationNotification: "animationNotification",
};
