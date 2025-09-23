import { GamePacketType } from '../enums/gamePacketType';
import { CardType, GlobalFailCode, PhaseType, WinType } from '../generated/common/enums';
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

export const gamePrepareResponsePacketForm = (payload: S2CGamePrepareResponse): GamePacket => {
	return {
		payload: {
			oneofKind: 'gamePrepareResponse',
			gamePrepareResponse: payload,
		},
	};
};

export const gamePrepareNotificationPacketForm = (room: Room): GamePacket => {
	const notificationPayload: S2CGamePrepareNotification = {
		room: room,
	};

	return {
		payload: {
			oneofKind: 'gamePrepareNotification',
			gamePrepareNotification: notificationPayload,
		},
	};
};

export const gameStartResponsePacketForm = (payload: S2CGameStartResponse): GamePacket => {
	return {
		payload: {
			oneofKind: 'gameStartResponse',
			gameStartResponse: payload,
		},
	};
};

export const gameStartNotificationPacketForm = (
	gameState: GameStateData,
	users: User[],
	characterPositions: CharacterPositionData[],
): GamePacket => {
	const payload: S2CGameStartNotification = {
		gameState,
		users,
		characterPositions,
	};
	return {
		payload: {
			oneofKind: 'gameStartNotification',
			gameStartNotification: payload,
		},
	};
};

export const getRoomListResponseForm = (rooms: Room[]): GamePacket => {
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

export const joinRandomRoomResponseForm = (
	success: boolean,
	failCode: GlobalFailCode,
	room?: Room,
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

export const joinRoomNotificationForm = (joinUser: User): GamePacket => {
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

export const joinRoomResponseForm = (
	success: boolean,
	failCode: GlobalFailCode,
	room?: Room,
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

export const leaveRoomResponsePacketForm = (payload: S2CLeaveRoomResponse): GamePacket => {
	return {
		payload: {
			oneofKind: 'leaveRoomResponse',
			leaveRoomResponse: payload,
		},
	};
};

export const userLeftNotificationPacketForm = (payload: S2CLeaveRoomNotification): GamePacket => {
	return {
		payload: {
			oneofKind: 'leaveRoomNotification',
			leaveRoomNotification: payload,
		},
	};
};

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
				success: success,
				message: message,
				token: token,
				myInfo: myInfo,
				failCode: failCode,
			},
		},
	};

	return newGamePacket;
};

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

export const userUpdateNotificationPacketForm = (user: User[]): GamePacket => {
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