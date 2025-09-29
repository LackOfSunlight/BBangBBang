import { GamePacketType } from '../enums/gamePacketType';
import {
	AnimationType,
	CardType,
	GlobalFailCode,
	PhaseType,
	SelectCardType,
	WinType,
	WarningType,
} from '../generated/common/enums';
import {
	CardData,
	CharacterPositionData,
	GameStateData,
	RoomData,
	UserData,
} from '../generated/common/types';
import { GamePacket } from '../generated/gamePacket';
import { S2CGamePrepareResponse, S2CGameStartResponse } from '../generated/packet/game_actions';
import {
	S2CGamePrepareNotification,
	S2CGameStartNotification,
	S2CLeaveRoomNotification,
} from '../generated/packet/notifications';
import { S2CLeaveRoomResponse } from '../generated/packet/room_actions';
import { Room } from '../models/room.model';
import { User } from '../models/user.model';
import { broadcastDataToRoom } from '../sockets/notification';

/**
 * 회원가입 응답
 * @param success
 * @param message
 * @param failCode
 * @returns
 */
export const registerResponseForm = (
	success: boolean,
	message: string,
	failCode: GlobalFailCode,
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.registerResponse,
			registerResponse: {
				success,
				message,
				failCode,
			},
		},
	};

	return newGamePacket;
};

/**
 * 로그인 응답
 * @param success
 * @param message
 * @param token
 * @param failCode
 * @param myInfo
 * @returns
 */
export const loginResponseForm = (
	success: boolean,
	message: string,
	token: string,
	failCode: GlobalFailCode,
	myInfo?: UserData,
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.loginResponse,
			loginResponse: {
				success,
				message,
				token,
				myInfo,
				failCode,
			},
		},
	};

	return newGamePacket;
};

/**
 *  방 생성 응답
 * @param success
 * @param failCode
 * @param room
 * @returns
 */
export const createRoomResponseForm = (
	success: boolean,
	failCode: GlobalFailCode,
	room?: RoomData,
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.createRoomResponse,
			createRoomResponse: {
				success,
				room,
				failCode,
			},
		},
	};

	return newGamePacket;
};

/**
 * 방 목록 응답
 * @param rooms
 * @returns
 */
export const getRoomListResponseForm = (rooms: RoomData[]): GamePacket => {
	const newGamaPacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.getRoomListResponse,
			getRoomListResponse: {
				rooms,
			},
		},
	};

	return newGamaPacket;
};

/**
 * 랜덤 방 참여 응답
 * @param success
 * @param failCode
 * @param room
 * @returns
 */
export const joinRandomRoomResponseForm = (
	success: boolean,
	failCode: GlobalFailCode,
	room?: RoomData,
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.joinRandomRoomResponse,
			joinRandomRoomResponse: {
				success,
				room,
				failCode,
			},
		},
	};

	return newGamePacket;
};

/**
 * 방 참여 알림
 * @param joinUser
 * @returns
 */
export const joinRoomNotificationForm = (joinUser: UserData): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.joinRoomNotification,
			joinRoomNotification: {
				joinUser,
			},
		},
	};

	return newGamePacket;
};

/**
 * 방 참여 응답
 * @param success
 * @param failCode
 * @param room
 * @returns
 */
export const joinRoomResponseForm = (
	success: boolean,
	failCode: GlobalFailCode,
	room?: RoomData,
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.joinRoomResponse,
			joinRoomResponse: {
				success,
				room,
				failCode,
			},
		},
	};

	return newGamePacket;
};

/**
 * 방 나가기 응답
 * @param payload
 * @returns
 */
export const leaveRoomResponsePacketForm = (payload: S2CLeaveRoomResponse): GamePacket => {
	return {
		payload: {
			oneofKind: GamePacketType.leaveRoomResponse,
			leaveRoomResponse: payload,
		},
	};
};

/**
 * 방 나간유저 알림
 * @param payload
 * @returns
 */
export const userLeftNotificationPacketForm = (payload: S2CLeaveRoomNotification): GamePacket => {
	return {
		payload: {
			oneofKind: GamePacketType.leaveRoomNotification,
			leaveRoomNotification: payload,
		},
	};
};

/**
 * 게임준비 응답
 * @param payload
 * @returns
 */
export const gamePrepareResponsePacketForm = (payload: S2CGamePrepareResponse): GamePacket => {
	return {
		payload: {
			oneofKind: GamePacketType.gamePrepareResponse,
			gamePrepareResponse: payload,
		},
	};
};
/**
 * 게임 준비 알림
 * @param room
 * @returns
 */
export const gamePrepareNotificationPacketForm = (room: RoomData): GamePacket => {
	const notificationPayload: S2CGamePrepareNotification = {
		room: room,
	};

	return {
		payload: {
			oneofKind: GamePacketType.gamePrepareNotification,
			gamePrepareNotification: notificationPayload,
		},
	};
};

/**
 * 게임시작 응답
 * @param payload
 * @returns
 */
export const gameStartResponsePacketForm = (payload: S2CGameStartResponse): GamePacket => {
	return {
		payload: {
			oneofKind: GamePacketType.gameStartResponse,
			gameStartResponse: payload,
		},
	};
};

/**
 * 게임시작 알림
 * @param gameState
 * @param users
 * @param characterPositions
 * @returns
 */
export const gameStartNotificationPacketForm = (
	gameState: GameStateData,
	users: UserData[],
	characterPositions: CharacterPositionData[],
): GamePacket => {
	const payload: S2CGameStartNotification = {
		gameState,
		users,
		characterPositions,
	};
	return {
		payload: {
			oneofKind: GamePacketType.gameStartNotification,
			gameStartNotification: payload,
		},
	};
};

/**
 * 플리마켓 응답
 * @param success
 * @param failCode
 * @returns
 */
export const fleaMarketResponseForm = (success: boolean, failCode: GlobalFailCode): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.fleaMarketPickResponse,
			fleaMarketPickResponse: {
				success,
				failCode,
			},
		},
	};

	return newGamePacket;
};

/**
 * 플리마켓 알림
 * @param cardTypes
 * @param pickIndex
 * @returns
 */
export const fleaMarketNotificationForm = (
	cardTypes: CardType[],
	pickIndex: number[],
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.fleaMarketNotification,
			fleaMarketNotification: {
				cardTypes,
				pickIndex,
			},
		},
	};

	return newGamePacket;
};

/**
 * 디버프 패스 응답
 * @param success
 * @param failCode
 * @returns
 */
export const passDebuffResponseForm = (success: boolean, failCode: GlobalFailCode): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.passDebuffResponse,
			passDebuffResponse: {
				success,
				failCode,
			},
		},
	};

	return newGamePacket;
};

/**
 * 경고 알림
 * @param warningType
 * @param expectedAt
 * @returns
 */
export const warnNotificationPacketForm = (
	warningType: WarningType,
	expectedAt: string,
): GamePacket => {
	const NotificationPacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.warningNotification,
			warningNotification: {
				warningType: warningType,
				expectedAt: expectedAt,
			},
		},
	};

	return NotificationPacket;
};

/**
 * 카드사용 응답
 * @param success
 * @param failCode
 * @returns
 */
export const useCardResponsePacketForm = (
	success: boolean,
	failCode: GlobalFailCode,
): GamePacket => {
	const ResponsePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.useCardResponse,
			useCardResponse: {
				success,
				failCode,
			},
		},
	};

	return ResponsePacket;
};

/**
 * 카드사용 알림
 * @param cardType
 * @param userId
 * @param targetUserId
 * @returns
 */
export const useCardNotificationPacketForm = (
	cardType: CardType,
	userId: string,
	targetUserId: string,
): GamePacket => {
	const NotificationPacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.useCardNotification,
			useCardNotification: {
				cardType: cardType,
				userId: userId,
				targetUserId: targetUserId !== '0' ? targetUserId : '0',
			},
		},
	};

	return NotificationPacket;
};

/**
 * 유저정보 업데이트 알림
 * @param user
 * @returns
 */
export const userUpdateNotificationPacketForm = (user: UserData[]): GamePacket => {
	const NotificationPacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.userUpdateNotification,
			userUpdateNotification: {
				user: user,
			},
		},
	};

	return NotificationPacket;
};

/**
 * 포지션 업데이트 알림
 * @param characterPositions
 * @returns
 */
export const positionUpdateNotificationForm = (
	characterPositions: CharacterPositionData[],
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.positionUpdateNotification,
			positionUpdateNotification: {
				characterPositions,
			},
		},
	};
	return newGamePacket;
};

/**
 * 페이즈업데이트 알림
 * @param phaseType
 * @param nextPhaseAt
 * @param characterPositions
 * @returns
 */
export const phaseUpdateNotificationForm = (
	phaseType: PhaseType, // DAY 1, EVENING 2, END 3
	nextPhaseAt: string, // 다음 페이즈 시작 시점(밀리초 타임스탬프)
	characterPositions: CharacterPositionData[], // 변경된 캐릭터 위치
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.phaseUpdateNotification,
			phaseUpdateNotification: {
				phaseType,
				nextPhaseAt,
				characterPositions,
			},
		},
	};

	return newGamePacket;
};

/**
 * 카드 장비 알림
 * @param cardType
 * @param userId
 * @returns
 */
export const equipCardNotificationForm = (cardType: CardType, userId: string) => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.equipCardNotification,
			equipCardNotification: {
				cardType,
				userId,
			},
		},
	};
	return newGamePacket;
};

/**
 * 장비 효과 발동 알림
 * @param cardType
 * @param userId
 * @param success
 * @returns
 */
export const cardEffectNotificationForm = (
	cardType: CardType,
	userId: string,
	success: boolean,
) => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.cardEffectNotification,
			cardEffectNotification: {
				cardType,
				userId,
				success,
			},
		},
	};
	return newGamePacket;
};

/**
 * 리액션 응답
 * @param success
 * @param failCode
 * @returns
 */
export const reactionResponsePacketForm = (
	success: boolean,
	failCode: GlobalFailCode,
): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.reactionResponse,
			reactionResponse: {
				success,
				failCode,
			},
		},
	};
	return newGamePacket;
};

/**
 * 애니메이션 알림
 * @param users
 * @param userId
 * @param animationType
 */
export const animationNotificationForm = (
	users: UserData[],
	userId: string,
	animationType: AnimationType,
) => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.animationNotification,
			animationNotification: {
				userId,
				animationType,
			},
		},
	};

	return newGamePacket;
};

/**
 * 밤시간 카드 제거 응답
 * @param handCards
 * @returns
 */
export const destroyResponseForm = (handCards: CardData[]): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.destroyCardResponse,
			destroyCardResponse: {
				handCards,
			},
		},
	};

	return newGamePacket;
};

/**
 * 게임 종료 알림
 * @param winners
 * @param winType
 * @returns
 */
export const gameEndNotificationForm = (winners: string[], winType: WinType): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.gameEndNotification,
			gameEndNotification: {
				winners,
				winType,
			},
		},
	};

	return newGamePacket;
};

/**
 * 카드선택 응답
 * @param success
 * @param failCode
 * @returns
 */
export const cardSelectResponseForm = (success: boolean, failCode: GlobalFailCode): GamePacket => {
	const newGamePacket: GamePacket = {
		payload: {
			oneofKind: GamePacketType.cardSelectResponse,
			cardSelectResponse: {
				success,
				failCode,
			},
		},
	};
	return newGamePacket;
};
